import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { TextControl, PanelBody, Button, DatePicker, RangeControl, ToggleControl,  SelectControl } from '@wordpress/components';

import './style.scss';

import metadata from './block.json';

// Manual call to fetch the observations from the editor page once query settings are entered
function refreshQuery() {
	// Find all the iNaturalist blocks on the page
	let inatgrids = document.querySelectorAll('.ws-inat-grid-container')
    let baseUrl = 'https://api.inaturalist.org/v1/observations'

	let valueMap = {
		'needs_id': 'ID',
		'research': 'RG',
		'casual': '',
		'Needs ID': 'ID',
		'Research Grade': 'RG',
		'':''
	};
	let inverseMap = {
		'ID': 'Needs ID',
		'RG': 'Research Grade',
		'': ''
	};

	// Query the iNaturalist API for each block
    inatgrids.forEach(function(inatgrid) {
		// Remove the placeholder text
		try{
			let placeholder = inatgrid.nextElementSibling;
			placeholder.remove();
		} catch (error) {} // We don't care if the text has already been removed

		// Parse the query variables from the html dataset
        let params = {...inatgrid.dataset}

		// Formats the ISO date strings to the format iNaturalist expects
		params.d1 = formatAPIdate(params.d1);
		params.d2 = formatAPIdate(params.d2);
		
		// Form the API url with the query strings
        let url = new URL(baseUrl);
        url.search = new URLSearchParams(params).toString()
		
		// If there's an existing grid, remove it before appending more items
		inatgrid.innerHTML = '';

        fetch(url)
        .then(response => {
			if (!response.ok) {
				// This will be returned if iNaturalist responded, but didn't like the query
				// We throw an error that will be caught and displayed to the user in the editor
				return response.json().then(errorData => { throw new Error(`${errorData.error} Status: ${response.status}`) });
			}
			return response.json();
		})
        .then(data => {
            console.log(data)

			// If no results are found, throw an error that will be displayed in the editor
			if (data.results.length == 0) {
				throw new Error('No observations found for search criteria.');
			}
            
			// Iterate through all results, creating a grid item for each
            data.results.forEach(item => {
				// Create all needed elements
                let gridItemDiv = document.createElement('div');
                let topRowDiv = document.createElement('div');
                let speciesDiv = document.createElement('div');
                let idsDiv = document.createElement('div');
                let gradeDiv = document.createElement('div');
                let gridLink = document.createElement('a');

				// Replace the tiny image url with a slightly higher resolution version
                let bgurl = item.observation_photos[0].photo.url
                bgurl = bgurl.replace('square.jpg', 'small.jpg');

				// Add the right text to the right places
                speciesDiv.innerText = item.taxon.preferred_common_name ? 
                    (item.taxon.preferred_common_name) : (item.taxon.name);
				let idsSuffix = item.identifications.length == 1 ? ' ID' : ' IDs';
                idsDiv.innerText = item.identifications.length + idsSuffix
                gradeDiv.innerText = valueMap[item.quality_grade]

				// Add some css classes
                gridLink.classList.add('ws-inat-link'); 
                gridItemDiv.classList.add('ws-inat-item')
				topRowDiv.classList.add('ws-inat-top-row-info')
				idsDiv.classList.add('ws-inat-info')
				gradeDiv.classList.add('ws-inat-info')
				speciesDiv.classList.add('ws-inat-info')
                
				// Set the background image via inline css and set the link href
                gridLink.href = item.uri;
                gridLink.style.backgroundImage = `url('${bgurl}')`;

				// Add a function to expand the grade text on hover
				gridLink.addEventListener('mouseover', function(){
					gradeDiv.textContent = inverseMap[gradeDiv.textContent]
				});
				gridLink.addEventListener('mouseout', function(){
					gradeDiv.textContent = valueMap[gradeDiv.textContent]
				});

				// Assemble all the elements
				topRowDiv.appendChild(idsDiv)
				topRowDiv.appendChild(gradeDiv)

				gridItemDiv.appendChild(topRowDiv)
                gridItemDiv.appendChild(speciesDiv);

                gridLink.appendChild(gridItemDiv);
    
                inatgrid.appendChild(gridLink);
            })
        })
        .catch((error) => {
			// Display any errors in the editor. Will be deleted upon refresh by the same code that removed the placeholder text
            let newP = document.createElement('p')
			newP.innerText = error
			inatgrid.insertAdjacentElement('afterend', newP)
			console.error('Error:', error);
        });
    })
}

function formatFriendlyDate(isoDateStr) {
    const date = new Date(isoDateStr);
    const month = date.getMonth() + 1; // getMonth() is zero-indexed, so we add 1
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
}

function formatAPIdate( isoDateStr ) {
	const date = new Date(isoDateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-indexed, so we add 1
    const day = String(date.getDate()).padStart(2, '0'); // pad minutes with 0 if necessary
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
	if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString)) {
		return false;
	}

	const [year, month, day] = dateString.split('-');

	return new Date(year, month - 1, day); // The month argument is 0-indexed, so subtract 1
}

// Register the block
registerBlockType( metadata.name, {
	// Set a custom icon
	icon: <svg width="202px" height="179px" viewBox="0 0 202 179"><title>iNaturalist-Logo</title><g id="iNaturalist-Logo" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M0,20.7263158 C54.5248587,26.3201751 97.3849609,46.3506571 128.580307,80.8177618 C129.79793,82.1630894 133.17907,85.9671053 135.762791,85.025 C138.346512,84.0828947 141.499632,78.1866754 142.878787,76.1338022 C145.044488,72.9101545 151.734884,61.4723684 166.297674,56.7618421 C180.860465,52.0513158 199.313331,57.29323 199.98336,57.5252042 C201.242664,57.9611941 202.513754,58.5328898 201.788146,59.5540524 C201.062539,60.5752149 194.897364,63.0330024 190.708719,71.0598586 C186.227594,79.6472066 183.593875,96.2609609 182.94767,99.9224135 C180.402526,115.000988 174.299302,128.982225 165.472214,140.864406 C149.941743,161.770039 125.979483,176.17799 98.1288182,178.632593 C82.9034426,179.974473 68.2067059,177.594989 54.9232727,172.242093 C71.020061,170.658979 90.50223,163.000959 106.151872,144.665804 C125.897674,121.531579 104.288372,133.543421 85.7325581,130.481579 C72.7319736,128.336389 62.1504527,121.641086 44.3908476,98.9974003 C50.0879988,97.4013289 61.3190036,95.4542789 70.3782277,95.0660826 C53.6217502,91.2098699 31.3919846,80.5885837 21.5565397,64.2256177 C29.4608287,61.4778099 39.861857,62.475544 48.1719022,62.8370987 C16.5208943,43.7475222 2.87054309,33.46405 0,20.7263158 Z M75.6325581,-8.52651283e-14 C77.5030666,0.913766419 105.702313,13.1841017 119.32093,31.5605263 C138.346512,57.2328947 139.051163,81.9631579 133.883721,76.3105263 C121.740896,63.0275681 110.57747,54.5219154 96.772093,44.9855263 C86.2023256,37.6842105 79.1384898,16.8742837 75.6325581,-8.52651283e-14 Z M173.874316,64.0813655 C171.289891,64.308092 169.378097,66.5927128 169.604204,69.1842089 C169.830312,71.775705 172.1087,73.6927294 174.693126,73.4660029 C177.277551,73.2392764 179.189345,70.9546556 178.963237,68.3631595 C178.737129,65.7716635 176.458742,63.854639 173.874316,64.0813655 Z" id="iNaturalist-Logo" fill="#74AC00"></path></g></svg>,

	edit: function(props) {

		const { attributes: { user_id, d1, d2, per_page, gridSize, gridGap, showHeader, headerLevel }, setAttributes} = props;
		const blockProps = useBlockProps()
		const HeaderElement = headerLevel
		const postType = useSelect(
            ( select ) => select( 'core/editor' ).getCurrentPostType(),
            []
        );
        const [ meta ] = useEntityProp( 'postType', postType, 'meta');

		// Initialize the date values with the 'activity_date' and 'activity_end_date' post metadata
		// 	if they exist in correct YYYY-MM-DD format, otherwise with the current date
		let now = new Date()
		if (!d1) {
			let date1 = parseDate(meta['activity_date']) ?
				parseDate(meta['activity_date']) :
				new Date(now.getFullYear(), now.getMonth(), now.getDate())
			setAttributes({ d1: date1.toISOString() });
		}
		if (!d2) {			
			let date2 = parseDate(meta['activity_end_date']) ?
				parseDate(meta['activity_end_date']) : 
				parseDate(meta['activity_date']) ?
				parseDate(meta['activity_date']) :
				new Date(now.getFullYear(), now.getMonth(), now.getDate())
			setAttributes({ d2: date2.toISOString() });
		}

		return (
			<div { ...blockProps }>
				<InspectorControls>
                    <PanelBody title="Observation Query" initialOpen={true}>
                        <TextControl
                            label="iNat Username"
                            value={user_id}
                            onChange={ ( value ) => setAttributes({ user_id: value })}
                        />
						<PanelBody title={`Start Date: ${formatFriendlyDate(d1)}`} initialOpen={false}>						
							<DatePicker
								currentDate = { d1 }
								onChange={ ( newDate ) => setAttributes({ d1: newDate })}
							/>
						</PanelBody>
						<PanelBody title={`End Date: ${formatFriendlyDate(d2)}`} initialOpen={false}>	
							<DatePicker 
								currentDate = { d2 }
								onChange={ ( newDate ) => setAttributes({ d2: newDate })}
							/>
						</PanelBody>
						<PanelBody title="Advanced Parameters" initialOpen={false}>
							<RangeControl
								label="Maximum number of observations"
								value={per_page}
								onChange={(value) => setAttributes({ per_page: value})}
								min={1}
								max={200}
							/>
						</PanelBody>
						<Button 
							variant="primary"
                        	onClick={ () => refreshQuery() }
                    	>
                       		Preview
                    	</Button>
                    </PanelBody>
					<PanelBody title="Layout" initialOpen={false}>
						<RangeControl
							label="Minimum Item Size"
							value={gridSize}
							onChange={(value) => setAttributes({ gridSize: value })}
							min={50}
							max={300}
						/>
						<RangeControl
							label="Grid Gap"
							value={gridGap}
							onChange={(value) => setAttributes({ gridGap: value })}
							min={0}
							max={50}
						/>
					</PanelBody>
					<PanelBody title="Header" initialOpen={false}>
						<ToggleControl 
							label="Show Header"
							checked={showHeader}
							onChange={(value) => setAttributes({ showHeader: value})}
						/>
						<SelectControl
							label="Header Level"
							value={ headerLevel }
							options={ [
								{ label: 'h1', value: 'h1' },
								{ label: 'h2', value: 'h2' },
								{ label: 'h3', value: 'h3' },
								{ label: 'h4', value: 'h4' },
								{ label: 'h5', value: 'h5' },
								{ label: 'h6', value: 'h6' },
								{ label: 'h7', value: 'h7' },
							] }
							onChange={ ( value ) => {
								setAttributes( { headerLevel: value } );
							} }
						/>
						{/* <FontSizePicker
							value={headerFontSize}
							units='rem'
							onChange={(value) => console.log(value)}
						/> */}
					</PanelBody>
					{/* <PanelBody title="Taxon Name Text" initialOpen={false}>
					</PanelBody>
					<PanelBody title="Supplemental Text" initialOpen={false}>
					</PanelBody> */}
                </InspectorControls>
				{  showHeader ? (
					<div class='ws-inat-block-header'>
						<svg width="202px" height="179px" viewBox="0 0 202 179"><title>iNaturalist</title><g id="iNaturalist-Logo" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M0,20.7263158 C54.5248587,26.3201751 97.3849609,46.3506571 128.580307,80.8177618 C129.79793,82.1630894 133.17907,85.9671053 135.762791,85.025 C138.346512,84.0828947 141.499632,78.1866754 142.878787,76.1338022 C145.044488,72.9101545 151.734884,61.4723684 166.297674,56.7618421 C180.860465,52.0513158 199.313331,57.29323 199.98336,57.5252042 C201.242664,57.9611941 202.513754,58.5328898 201.788146,59.5540524 C201.062539,60.5752149 194.897364,63.0330024 190.708719,71.0598586 C186.227594,79.6472066 183.593875,96.2609609 182.94767,99.9224135 C180.402526,115.000988 174.299302,128.982225 165.472214,140.864406 C149.941743,161.770039 125.979483,176.17799 98.1288182,178.632593 C82.9034426,179.974473 68.2067059,177.594989 54.9232727,172.242093 C71.020061,170.658979 90.50223,163.000959 106.151872,144.665804 C125.897674,121.531579 104.288372,133.543421 85.7325581,130.481579 C72.7319736,128.336389 62.1504527,121.641086 44.3908476,98.9974003 C50.0879988,97.4013289 61.3190036,95.4542789 70.3782277,95.0660826 C53.6217502,91.2098699 31.3919846,80.5885837 21.5565397,64.2256177 C29.4608287,61.4778099 39.861857,62.475544 48.1719022,62.8370987 C16.5208943,43.7475222 2.87054309,33.46405 0,20.7263158 Z M75.6325581,-8.52651283e-14 C77.5030666,0.913766419 105.702313,13.1841017 119.32093,31.5605263 C138.346512,57.2328947 139.051163,81.9631579 133.883721,76.3105263 C121.740896,63.0275681 110.57747,54.5219154 96.772093,44.9855263 C86.2023256,37.6842105 79.1384898,16.8742837 75.6325581,-8.52651283e-14 Z M173.874316,64.0813655 C171.289891,64.308092 169.378097,66.5927128 169.604204,69.1842089 C169.830312,71.775705 172.1087,73.6927294 174.693126,73.4660029 C177.277551,73.2392764 179.189345,70.9546556 178.963237,68.3631595 C178.737129,65.7716635 176.458742,63.854639 173.874316,64.0813655 Z" id="iNaturalist-Logo" fill="#74AC00"></path></g></svg>
						<HeaderElement>Observations</HeaderElement>
					</div>
				 	) : ( '' )
				}
				<div 
					class="ws-inat-grid-container" 
					// Allows reactive adjustments to the grid layout section
					style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`, 
    						 gridGap: `${gridGap}px` }}
					// Include the block attributes in the html dataset so they can be easily accessed by javascript
					data-user_id={user_id}
					data-d1={d1} 
					data-d2={d2}
					data-per_page={per_page}>
				</div>
				<div class="ws-inat-editor-placeholder">
					<inline>
						Enter observation search parameters in the block settings sidebar, then click the 'Preview' button.
					</inline>
					<Button 
						variant="primary"
						onClick={ () => refreshQuery() }
					>
						Preview
					</Button>
				</div>
			</div>
		);
	},
	
	save: function(props) {
		const { attributes: { user_id, d1, d2, per_page, gridSize, gridGap, showHeader, headerLevel } } = props;

		const blockProps = useBlockProps.save()
		const HeaderElement = headerLevel
	
		return (
			<div { ...blockProps }>
				{  showHeader ? (
					<div class='ws-inat-block-header'>
						<svg width="202px" height="179px" viewBox="0 0 202 179"><title>iNaturalist</title><g id="iNaturalist-Logo" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M0,20.7263158 C54.5248587,26.3201751 97.3849609,46.3506571 128.580307,80.8177618 C129.79793,82.1630894 133.17907,85.9671053 135.762791,85.025 C138.346512,84.0828947 141.499632,78.1866754 142.878787,76.1338022 C145.044488,72.9101545 151.734884,61.4723684 166.297674,56.7618421 C180.860465,52.0513158 199.313331,57.29323 199.98336,57.5252042 C201.242664,57.9611941 202.513754,58.5328898 201.788146,59.5540524 C201.062539,60.5752149 194.897364,63.0330024 190.708719,71.0598586 C186.227594,79.6472066 183.593875,96.2609609 182.94767,99.9224135 C180.402526,115.000988 174.299302,128.982225 165.472214,140.864406 C149.941743,161.770039 125.979483,176.17799 98.1288182,178.632593 C82.9034426,179.974473 68.2067059,177.594989 54.9232727,172.242093 C71.020061,170.658979 90.50223,163.000959 106.151872,144.665804 C125.897674,121.531579 104.288372,133.543421 85.7325581,130.481579 C72.7319736,128.336389 62.1504527,121.641086 44.3908476,98.9974003 C50.0879988,97.4013289 61.3190036,95.4542789 70.3782277,95.0660826 C53.6217502,91.2098699 31.3919846,80.5885837 21.5565397,64.2256177 C29.4608287,61.4778099 39.861857,62.475544 48.1719022,62.8370987 C16.5208943,43.7475222 2.87054309,33.46405 0,20.7263158 Z M75.6325581,-8.52651283e-14 C77.5030666,0.913766419 105.702313,13.1841017 119.32093,31.5605263 C138.346512,57.2328947 139.051163,81.9631579 133.883721,76.3105263 C121.740896,63.0275681 110.57747,54.5219154 96.772093,44.9855263 C86.2023256,37.6842105 79.1384898,16.8742837 75.6325581,-8.52651283e-14 Z M173.874316,64.0813655 C171.289891,64.308092 169.378097,66.5927128 169.604204,69.1842089 C169.830312,71.775705 172.1087,73.6927294 174.693126,73.4660029 C177.277551,73.2392764 179.189345,70.9546556 178.963237,68.3631595 C178.737129,65.7716635 176.458742,63.854639 173.874316,64.0813655 Z" id="iNaturalist-Logo" fill="#74AC00"></path></g></svg>
						<HeaderElement>Observations</HeaderElement>
					</div>
				 	) : ( '' )
				}
				<div 
					class="ws-inat-grid-container" 
					style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`, 
    						 gridGap: `${gridGap}px` }}
					data-user_id={user_id}
					data-d1={d1}
					data-d2={d2}
					data-per_page={per_page}
				></div>
			</div>
		);
	}
} );