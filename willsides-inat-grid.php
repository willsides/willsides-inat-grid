<?php
/**
 * Plugin Name:       Grid of iNaturalist Observations
 * Plugin URI:        github.com/willsides/willsides-inat-grid
 * Description:       Displays a grid of observations from iNaturalist
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            Will Sides
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       willsides-inat-grid
 *
 * @package           willsides
 */

function willsides_inat_grid_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'willsides_inat_grid_block_init' );
