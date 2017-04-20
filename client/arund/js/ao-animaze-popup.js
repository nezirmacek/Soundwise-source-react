/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Animaze Popup requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Animaze Popup requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    aRD.positionWatch.blackout                              = function ($el){
        var _els                                            = aRD.getData($el, 'ao__blackOutEls', {});
        jQuery.each( _els, function (i, $_bel){
            $_bel.insertBefore($el);
        });
    };
    aRD.animation.type('popup', {
        keys                                                : ['popup'],
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val);
            return data;
        },
        initFn                                              : function ($el){
            aRD.getAniObj($el).triggerSub('popup-init');
        },
        startFn                                             : function ($el, data, animation){
            if( !$el.data('aoPopup__precss') ){
                $el.data('aoPopup__precss', {
                    position                                : $el.css('position'),
                    zIndex                                  : $el.css('zIndex')
                });
            }
            $el
                .addClass('ao-popup')
                .off('.aoPopup')
                .on({
                    'aoBlockShow.aoPopupActs'           : function (e){
                        if( e.target === e.currentTarget ){
                            var $pop                        = jQuery(this);
                            $pop.off('aoresize.aoPopupActs');
                            if( $pop.is('[data-ao-animaze-popupresize]') ){
                                $pop
                                    .on('aoresize.aoPopupActs', function (){
                                        jQuery(this).aoAnimaze('popupresize');
                                    })
                                ;
                            }else if( $pop.find('[data-ao-animaze-on-popupresize]').length ){
                                $pop
                                    .on('aoresize.aoPopupActs', function (){
                                        aRD.getAniObj( jQuery(this) ).triggerSub('popupresize', false);
                                    })
                                ;
                            }
                            aRD.getAniObj($pop).triggerSub('popup-shown');
                        }
                    },
                    'aoBlockPreHide.aoPopupActs'            : function (e){
                        if( e.target === e.currentTarget ){
                            jQuery(this).off('aoresize.aoPopupActs');
                        }
                    },
                    'aoBlockHide.aoPopupActs'               : function (e){
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
            var css                                         = {
                zIndex                                      : 'max'
            };
            if( !animation.hasKey('move') ){
                css.position                                = 'window';
                css.x                                       = {
                    value                                   : 0,
                    align                                   : 'center'
                };
                css.y                                       = {
                    value                                   : 0,
                    align                                   : 'middle'
                };
            }
            return jQuery.extend(css, aRD.parser.parse($el.attr('data-ao-popup-css')));
        }
    }, true, false, false);
    aRD.animation.type('blackout', {
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val);
            data.bName                                      = val.bName ? val.bName : false;
            data.eName                                      = data.bName || '__default';
            data.vAction                                    = typeof(val.vAction) === 'boolean' ? val.vAction : true;
            return data;
        },
        startFn                                             : function ($el, data){
            var bEls                                        = aRD.getData($el, 'ao__blackOutEls', {}),
                bElsT                                       = aRD.getData($el, 'ao__blackOutEls_timeouts', {}),
                name                                        = data.eName,
                $bEl                                        = bEls[name],
                css                                         = {}
            ;
            if( bElsT[name] ){
                clearTimeout( bElsT[name] );
                bElsT[name]                                 = null;
            }
            if( data.vAction ){
                $el.off('.aoBlackoutDestroy').on('destroyed.aoBlackOutDestroy', function (){
                    var $_el                                = jQuery(this),
                        _els                                = aRD.getData($_el, 'ao__blackOutEls', {}),
                        timeouts                            = aRD.getData($_el, 'ao__blackOutEls_timeouts', {})
                    ;
                    jQuery.each( timeouts, function (i, t){
                        if( t ){
                            clearTimeout(t);
                            timeouts[i]                     = null;
                        }
                    });
                    jQuery.each( _els, function (i, $_bel){
                        $_bel.remove();
                    });
                });
                bElsT[name]                                 = setTimeout(function (){
                    bElsT[name]                             = false;
                    if( $el.css('position') === 'static' ){
                        $el.css('position', 'relative');
                    }
                    if( !$bEl ){
                        $bEl                                = jQuery('<div style="display:none;"></div>')
                            .data({
                                'ao__blackOut_name'         : name,
                                'ao__blackOut_el'           : $el
                            })
                            .attr(aRD.getAttrByPref($el, 'data-ao-blackout' + (data.bName ? '-' + data.bName : '') + '-', true, 'data-ao-'))
                            .aoInit('filter', true)
                        ;
                        if( $bEl.is('[data-ao-hide-main]') ){
                            $bEl.off('.aoBlackOutHideMain').on('click.aoBlackOutHideMain', function (e){
                                e.preventDefault();
                                var $thEl                   = jQuery(this);
                                aRD.block.toggle($thEl.data('ao__blackOut_el'), false, false, $thEl.data('aoHideMain'));
                            });
                        }
                        bEls[name]                          = $bEl;
                    }
                    $bEl
                        .css({
                            position                        : 'fixed',
                            left                            : 0,
                            top                             : 0,
                            width                           : '100%',
                            height                          : '100%',
                            backgroundColor                 : '#000',
                            zIndex                          : $el.css('zIndex')
                        })
                        .insertBefore($el)
                        .aoShow()
                    ;
                });
                css.zIndex                                  = 'max';
            }else if($bEl){
                $bEl.aoHide( false, function ($hEl) {
                    var $_el                                = $hEl.data('ao__blackOut_el'),
                        _bels                               = $_el.data('ao__blackOutEls'),
                        _name                               = $hEl.data('ao__blackOut_name')
                    ;
                    if( _bels && _bels[_name] ){
                        delete _bels[_name];
                    }
                    $hEl.remove();
                });
            }
            return css;
        },
        properties                                          : [
            { checks                                            : aRD.parser.check('vAction') },
            { checks                                            : {
                name                                                : 'bName',
                type                                                : 'string'
            } }
        ]
    }, true, false, false);
    
    aRD.animation.type('singlescreen', {
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val);
            data.vAction                                    = typeof(val.vAction) === 'boolean' ? val.vAction : true;
            return data;
        },
        startFn                                             : function ($el, data){
            var $body                                       = jQuery('body');
            $body.css('overflow', data.vAction ? 'hidden' : '');
        },
        properties                                          : [
            { checks                                            : aRD.parser.check('vAction') }
        ]
    }, true, false, false);
    
    jQuery.fn.aoPopup                                       = function (){
        jQuery(this).each(function (i, el){
            aRD.block.triggerToggle(jQuery(el), false, true, 'popup');
        });
        return this;
    };
    $.fn.aoAddPopupOn                                       = function (opts, action){
        if( !aRD.hasElements(this, "aRunD - FireOn: add showOn - Nothing selected.") ){
            return this;
        }
        $(this)
            .aoAddFireOn('popup', opts, function (el){
                var $el                                     = $(el);
                if( $el.is('[data-ao-template]') ){
                    aRD.block.triggerToggle($el, $el.data('aoTemplate'), true, 'popup');
                }else{
                    aRD.block.show($el, action || 'aoPopupOn', 'popup');
                }
            })
        ;
        return this;
    };

    aRD.pushFlist('init', function ($container, findFn){
        $container[findFn]('[data-ao-popup-on]').aoAddPopupOn();
        $container[findFn]('[data-ao-hide-popup]').off('.pShowPopup').on('aoChange.pShowPopup.aoBlockForced', {
                preventOnlyLink     : true
            }, function (){
                var $el                                     = jQuery(this),
                    $popup                                  = $el.closest('.ao-popup')
                ;
                if( $popup.length ){
                    aRD.block.toggle($popup, false, false, $el.data('aoHidePopup'));
                }
            }
        );
        $container[findFn]('[data-ao-show-popup]').off('.pShowPopup').on('aoChange.pShowPopup.aoBlockForced', {
                preventOnlyLink     : true
            }, function (){
                aRD.block.triggerToggle(jQuery(this), jQuery(this).data('aoShowPopup'), true, 'popup');
            }
        );
    });
}));