document.addEventListener("DOMContentLoaded", function() {
    function formatAPIdate( isoDateStr ) {
        const date = new Date(isoDateStr);
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-indexed, so we add 1
        const day = String(date.getDate()).padStart(2, '0'); // pad minutes with 0 if necessary
        const year = date.getFullYear();
    
        return `${year}-${month}-${day}`;
    }

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

    inatgrids.forEach(function(inatgrid) {
        let params = {...inatgrid.dataset}

		params.d1 = formatAPIdate(params.d1);
		params.d2 = formatAPIdate(params.d2);

        let url = new URL(baseUrl);
        url.search = new URLSearchParams(params).toString()

        fetch(url)
        .then(response => {
			if (!response.ok) {
				return response.json().then(errorData => { throw new Error(`${errorData.error} Status: ${response.status}`) });
			}
			return response.json();
		})
        .then(data => {

			if (data.results.length == 0) {
				throw new Error('No observations to show.');
			}
            
            data.results.forEach(item => {
                let gridItemDiv = document.createElement('div');
                let topRowDiv = document.createElement('div');
                let speciesDiv = document.createElement('div');
                let idsDiv = document.createElement('div');
                let gradeDiv = document.createElement('div');
                let gridLink = document.createElement('a');

                let bgurl = item.observation_photos[0].photo.url
                bgurl = bgurl.replace('square.jpg', 'small.jpg');

                speciesDiv.innerText = item.taxon.preferred_common_name ? 
                    (item.taxon.preferred_common_name) : (item.taxon.name);
				let idsSuffix = item.identifications.length == 1 ? ' ID' : ' IDs';
                idsDiv.innerText = item.identifications.length + idsSuffix
                gradeDiv.innerText = valueMap[item.quality_grade]

                gridLink.classList.add('ws-inat-link'); 
                gridItemDiv.classList.add('ws-inat-item')
				topRowDiv.classList.add('ws-inat-top-row-info')
				idsDiv.classList.add('ws-inat-info')
				gradeDiv.classList.add('ws-inat-info')
				speciesDiv.classList.add('ws-inat-info')
                    
                gridLink.href = item.uri;
                gridLink.style.backgroundImage = `url('${bgurl}')`;

				gridLink.addEventListener('mouseover', function(){
					gradeDiv.textContent = inverseMap[gradeDiv.textContent]
				});
				gridLink.addEventListener('mouseout', function(){
					gradeDiv.textContent = valueMap[gradeDiv.textContent]
				});

				topRowDiv.appendChild(idsDiv)
				topRowDiv.appendChild(gradeDiv)

				gridItemDiv.appendChild(topRowDiv)
                gridItemDiv.appendChild(speciesDiv);

                gridLink.appendChild(gridItemDiv);
    
                inatgrid.appendChild(gridLink);
            })
        })
        .catch((error) => {
            let newP = document.createElement('p')
			newP.innerText = 'Error connecting to iNaturalist'
			inatgrid.insertAdjacentElement('afterend', newP)
			console.error('Error:', error);
        });
    })
  
  });