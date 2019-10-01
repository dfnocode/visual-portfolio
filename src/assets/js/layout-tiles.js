/*
 * Visual Portfolio layout Tiles.
 */
const $ = window.jQuery;

const {
    screenSizes,
} = window.VPData;

// fix masonry items position for Tiles layout.
// https://github.com/nk-o/visual-portfolio/issues/111
if ( typeof window.Isotope !== 'undefined' && typeof window.Isotope.LayoutMode !== 'undefined' ) {
    const MasonryMode = window.Isotope.LayoutMode.modes.masonry;

    if ( MasonryMode ) {
        const defaultMeasureColumns = MasonryMode.prototype.measureColumns;
        MasonryMode.prototype.measureColumns = function() {
            // if columnWidth is 0, default to columns count size.
            if ( ! this.columnWidth ) {
                const $vp = $( this.element ).closest( '.vp-portfolio[data-vp-layout="tiles"]' );

                // change column size for Tiles type only.
                if ( $vp.length && $vp[ 0 ].vpf ) {
                    const { vpf } = $vp[ 0 ];
                    const settings = vpf.getTilesSettings();

                    // get columns number
                    let columns = parseInt( settings[ 0 ], 10 ) || 1;

                    // calculate responsive.
                    let count = columns - 1;
                    let currentPoint = Math.min( screenSizes.length - 1, count );

                    for ( ; currentPoint >= 0; currentPoint-- ) {
                        if ( count > 0 && typeof screenSizes[ currentPoint ] !== 'undefined' ) {
                            if ( window.innerWidth <= screenSizes[ currentPoint ] ) {
                                columns = count;
                            }
                        }
                        count -= 1;
                    }

                    if ( columns ) {
                        this.columnWidth = this.containerWidth / columns;
                    }
                }
            }

            defaultMeasureColumns.call( this );
        };
    }
}

// Extend VP class.
$( document ).on( 'extendClass.vpf', ( event, VP ) => {
    if ( 'vpf' !== event.namespace ) {
        return;
    }

    /**
     * Get Tiles Layout Settings
     *
     * @returns {string} tiles layout
     */
    VP.prototype.getTilesSettings = function() {
        const self = this;

        const layoutArr = self.options.tilesType.split( /[:|]/ );

        // remove last empty item
        if ( typeof layoutArr[ layoutArr.length - 1 ] !== 'undefined' && ! layoutArr[ layoutArr.length - 1 ] ) {
            layoutArr.pop();
        }

        return layoutArr;
    };
} );

// Init Options.
$( document ).on( 'initOptions.vpf', ( event, self ) => {
    if ( 'vpf' !== event.namespace ) {
        return;
    }

    self.defaults.tilesType = '3|1,1|';

    if ( ! self.options.tilesType ) {
        self.options.tilesType = self.defaults.tilesType;
    }
} );

// Init Layout.
$( document ).on( 'initLayout.vpf', ( event, self ) => {
    if ( 'vpf' !== event.namespace ) {
        return;
    }

    if ( self.options.layout !== 'tiles' ) {
        return;
    }

    const settings = self.getTilesSettings();

    // get columns number
    const columns = parseInt( settings[ 0 ], 10 ) || 1;
    settings.shift();

    // set columns
    self.addStyle( '.vp-portfolio__item-wrap', {
        width: `${ 100 / columns }%`,
    } );

    // set items sizes
    if ( settings && settings.length ) {
        for ( let k = 0; k < settings.length; k++ ) {
            const size = settings[ k ].split( ',' );
            const w = parseFloat( size[ 0 ] ) || 1;
            const h = parseFloat( size[ 1 ] ) || 1;

            let itemSelector = '.vp-portfolio__item-wrap';
            if ( settings.length > 1 ) {
                itemSelector += `:nth-of-type(${ settings.length }n+${ k + 1 })`;
            }

            if ( w && w !== 1 ) {
                self.addStyle( itemSelector, {
                    width: `${ w * 100 / columns }%`,
                } );
            }
            self.addStyle( `${ itemSelector } .vp-portfolio__item-img-wrap::before`, {
                'margin-top': `${ h * 100 }%`,
            } );
        }
    }

    // calculate responsive.
    let count = columns - 1;
    let currentPoint = Math.min( screenSizes.length - 1, count );

    for ( ; currentPoint >= 0; currentPoint-- ) {
        if ( count > 0 && typeof screenSizes[ currentPoint ] !== 'undefined' ) {
            self.addStyle( '.vp-portfolio__item-wrap', {
                width: `${ 100 / count }%`,
            }, `screen and (max-width: ${ screenSizes[ currentPoint ] }px)` );
            self.addStyle( '.vp-portfolio__item-wrap:nth-of-type(n)', {
                width: `${ 100 / count }%`,
            }, `screen and (max-width: ${ screenSizes[ currentPoint ] }px)` );
        }
        count -= 1;
    }
} );
