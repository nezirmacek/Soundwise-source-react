/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD */

(function(aRD){
    aRD.positionWatch.blackout                          = function($el){
        var _els                                        = aRD.getData($el, 'ao__blackOutEls', {});
        jQuery.each( _els, function(i, $_bel){
            $_bel.insertBefore($el);
        });
    };
    aRD.aniAdd('popup', {
        keys                                            : ['popup'],
        init                                            : function($el, params, opts){
            aRD.getAniObj($el).triggerSub('popup-init');
            if( opts.move ){
                this.noPosition                         = true;
            }
        },
        start                                           : function($el){
            if( !$el.data('aoPopup__precss') ){
                $el.data('aoPopup__precss', {
                    position                            : $el.css('position'),
                    zIndex                              : $el.css('zIndex')
                });
            }
            $el
                .addClass('ao-popup')
                .off('.aoPopup')
                .on({
                    'aoBlockShow.aoPopupActs'           : function(e){
                        if( e.target === e.currentTarget ){
                            var $pop                        = jQuery(this);
                            $pop.off('aoresize.aoPopupActs');
                            if( $pop.is('[data-ao-animaze-popupresize]') ){
                                $pop
                                    .on('aoresize.aoPopupActs', function(){
                                        jQuery(this).aoAnimaze('popupresize');
                                    })
                                    .aoAnimaze('popupresize')
                                ;
                            }else if( $pop.find('[data-ao-animaze-on-popupresize]').length ){
                                $pop
                                    .on('aoresize.aoPopupActs', function(){
                                        aRD.getAniObj( jQuery(this) ).triggerSub('popupresize', false);
                                    })
                                ;
                                aRD.getAniObj($pop).triggerSub('popupresize', false);
                            }
                            aRD.getAniObj($pop).triggerSub('popup-shown');
                        }
                    },
                    'aoBlockPreHide.aoPopupActs'        : function(e){
                        if( e.target === e.currentTarget ){
                            jQuery(this).off('aoresize.aoPopupActs');
                        }
                    },
                    'aoBlockHide.aoPopupActs'           : function(e){
                        if( e.target === e.currentTarget ){
                            var $pop                        = jQuery(this);
                            aRD.setCss($pop, $pop.data('aoPopup__precss'));
                            $pop
                                .off('.aoPopupActs')
                                .removeClass('ao-popup')
                                .data('aoPopup__precss', null)
                            ;
                        }
                    }
                })
            ;
            aRD.getAniObj($el).triggerSub('popup');
            var css                                 = {
                zIndex                              : 'max'
            };
            if( !this.noPosition ){
                css.position                        = 'window';
                css.x                               = {
                    value                           : 0,
                    align                           : 'center'
                };
                css.y                               = {
                    value                           : 0,
                    align                           : 'middle'
                };
            }
            return jQuery.extend(css, aRD.getDataFromString($el.attr('data-ao-popup-css')));
        }
    }, false, true, true);
    aRD.aniAdd('blackout', {
            init                                    : function($el, params){
                var props                           = typeof(params) === 'object' ? params : {};
                this.bName                          = props.bName ? props.bName : false;
                this.eName                          = this.bName || '__default';
                this.vAction                        = typeof(props.vAction) === 'boolean' ? props.vAction : true;
            },
            start                                   : function($el){
                var bEls                            = aRD.getData($el, 'ao__blackOutEls', {}),
                    bElsT                           = aRD.getData($el, 'ao__blackOutEls_timeouts', {}),
                    name                            = this.eName,
                    $bEl                            = bEls[name],
                    css                             = {}
                ;
                if( bElsT[name] ){
                    clearTimeout( bElsT[name] );
                    bElsT[name]               = null;
                }
                if( this.vAction ){
                    
                    $el.off('.aoBlackoutDestroy').on('destroyed.aoBlackOutDestroy', function(){
                        var $_el                    = jQuery(this),
                            _els                    = aRD.getData($_el, 'ao__blackOutEls', {}),
                            timeouts                = aRD.getData($_el, 'ao__blackOutEls_timeouts', {})
                        ;
                        jQuery.each( timeouts, function(i, t){
                            if( t ){
                                clearTimeout(t);
                                timeouts[i]         = null;
                            }
                        });
                        jQuery.each( _els, function(i, $_bel){
                            $_bel.remove();
                        });
                    });
                    bElsT[name]               = setTimeout(function(){
                        bElsT[name]           = false;
                        if( $el.css('position') === 'static' ){
                            $el.css('position', 'relative');
                        }
                        if( !$bEl ){
                            $bEl                    = jQuery('<div style="display:none;"></div>')
                                .data({
                                    'ao__blackOut_name' : name,
                                    'ao__blackOut_el'   : $el
                                })
                                .attr(aRD.getAttrByPref($el, 'data-ao-blackout' + (this.bName ? '-' + this.bName : '') + '-', true, 'data-ao-'))
                                .aoInit('filter', true)
                            ;
                            if( $bEl.is('[data-ao-hide-main]') ){
                                $bEl.off('.aoBlackOutHideMain').on('click.aoBlackOutHideMain', function(e){
                                    e.preventDefault();
                                    var $thEl       = jQuery(this);
                                    aRD.toggleBlock($thEl.data('ao__blackOut_el'), false, false, $thEl.data('aoHideMain'));
                                });
                            }
                            bEls[name]            = $bEl;
                        }
                        $bEl
                            .css({
                                position            : 'fixed',
                                left                : 0,
                                top                 : 0,
                                width               : '100%',
                                height              : '100%',
                                backgroundColor     : '#000',
                                zIndex              : $el.css('zIndex')
                            })
                            .insertBefore($el)
                            .aoShow()
                        ;
                    });
                    css.zIndex                      = 'max';
                }else if($bEl){
                    $bEl.aoHide( false, function($hEl) {
                        var $_el                    = $hEl.data('ao__blackOut_el'),
                            _bels                   = $_el.data('ao__blackOutEls'),
                            _name                   = $hEl.data('ao__blackOut_name')
                        ;
                        if( _bels && _bels[_name] ){
                            delete _bels[_name];
                        }
                        $hEl.remove();
                    });
                }
                return css;
            }
        }, {
            list                                    : [
                { byCheck                               : aRD.checks.vAction },
                { byCheck                               : {
                    name                                    : 'bName',
                    type                                    : 'string'
                } }
            ]
        }, false, true, true);
    
    aRD.aniAdd('singlescreen', {
            init                                    : function($el, params){
                var props                           = typeof(params) === 'object' ? params : {};
                this.vAction                        = typeof(props.vAction) === 'boolean' ? props.vAction : true;
            },
            start                                   : function(){
                var $body                           = jQuery('body');
                $body.css('overflow', this.vAction ? 'hidden' : '');
            }
        }, {
            list                                    : [
                { byCheck                               : aRD.checks.vAction }
            ]
        }, false, true, true);
    
    jQuery.fn.aoPopup                               = function(){
        jQuery(this).each(function(i, el){
            aRD.triggerToggleBlock(jQuery(el), false, true, 'popup');
        });
        return this;
    };

    aRD.pushFlist('init', function($container, findFn){
        $container[findFn]('[data-ao-popup-on]').each(function(i, el){
            var $el                                     = jQuery(el);
            $el.aoAddShowOn( aRD.fromDataString( $el, 'aoPopupOn' ), 'popup', 'aoPopupOn' );
        });
        $container[findFn]('[data-ao-hide-popup]').off('.pShowPopup').on('aoChange.pShowPopup.pBlockForced', {
                preventOnlyLink     : true
            }, function(){
                var $el                                 = jQuery(this),
                    $popup                              = $el.closest('.ao-popup')
                ;
                if( $popup.length ){
                    aRD.toggleBlock($popup, false, false, $el.data('aoHidePopup'));
                }
            }
        );
        $container[findFn]('[data-ao-show-popup]').off('.pShowPopup').on('aoChange.pShowPopup.pBlockForced', {
                preventOnlyLink     : true
            }, function(){
                aRD.triggerToggleBlock(jQuery(this), jQuery(this).data('aoShowPopup'), true, 'popup');
            }
        );
    });
})(aRunD);