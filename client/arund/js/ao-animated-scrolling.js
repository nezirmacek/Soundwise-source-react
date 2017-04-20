/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Animated Scrolling requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Animated Scrolling requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    var easeCheck                                           = aRD.parser.newCheck('ease', {
            check                                           : aRD.animation.hasEase
        }),
        parser                                              = aRD.parser.newProperty({
            type                                            : {
                list                                            : [
                    { checks                                        : aRD.parser.check('duration') },
                    { checks                                        : aRD.parser.check('delay') },
                    { checks                                        : [easeCheck,
                        aRD.parser.newCheck('to', 'size'),
                        {
                            name                                        : 'block',
                            type                                        : 'string'
                        }]},
                    { checks                                        : easeCheck},
                    { checks                                        : aRD.parser.newCheck('easeX', 'number')}
                ]
            }
        }),
        scrollTo                                            = function (options){
            aRD.$w.off('.aoWindowScroll').on({
                'scroll.aoWindowScroll'                     : function (){
                    var isScrolling                         = aRD.$w.data('aoIsScrolling');
                        timeout                             = aRD.$w.data('aoWindowScroll')
                    ;
                    if(!isScrolling && timeout){
                        clearTimeout(timeout);
                        aRD.$w
                            .data('aoWindowScroll', null)
                            .off('.aoWindowScroll')
                        ;
                        aRD.canFireOn                       = true;
                    }
                    aRD.$w.data('aoIsScrolling', null);
                },
                'wheel.aoWindowScroll'                      : function (){
                    var timeout                             = aRD.$w.data('aoWindowScroll');
                    if(timeout){
                        clearTimeout(timeout);
                    }
                    aRD.$w
                        .data('aoWindowScroll', null)
                        .data('aoIsScrolling', null)
                        .off('.aoWindowScroll')
                    ;
                    aRD.canFireOn                           = true;
                }
            });
            var params                                      = jQuery.extend({
                        duration                            : 0,
                        delay                               : 0,
                        to                                  : {
                            value                           : 0,
                            type                            : 'px'
                        },
                        ease                                : 'linear'
                    }, options),
                from                                        = aRD.$w.scrollTop(),
                time                                        = params.delay + Date.now(),
                toTime                                      = time + params.duration,
                timeout                                     = aRD.$w.data('aoWindowScroll'),
                func                                        = function (){
                    var now                                 = Date.now();
                    aRD.$w.data('aoIsScrolling', true);
                    if( now >= toTime ){
                        aRD.canFireOn                       = true;
                        aRD.$w
                            .off('.aoWindowScroll')
                            .scrollTop(params.to)
                        ;
                    }else{
                        var delta                           = params.ease((now - time)/params.duration, params.easeX);
                        aRD.$w.scrollTop(aRD.loopRange( from + params.distance * delta, 0, jQuery('body')[0].scrollHeight ));
                        aRD.$w.data('aoWindowScroll', setTimeout(func, 20));
                    }
                },
                $toEl, fixTo
            ;
            params.ease                                     = aRD.animation.ease( params.ease && aRD.animation.hasEase(params.ease) ? params.ease : 'linear');
            
            if( timeout ){
                clearTimeout(timeout);
            }
            if( params.block ){
                $toEl                                       = aRD.block.find(params.block);
                if( !$toEl.length ){
                    aRD.canFireOn                           = true;
                    return;
                }
                params.to                                   = $toEl.offset().top;
            }else if( params.to ){
                params.to                                   = aRD.fixSizeValue(params.to, aRD.getContentSize().height);
            }else{
                params.to                                   = 0;
            }
            aRD.canFireOn                                   = false;
            fixTo                                           = Math.round(params.to);
            if( fixTo !== params.to && jQuery('body')[0].scrollHeight >= fixTo ){
                params.to                                   = fixTo;
            }else{
                params.to                                   = Math.floor(params.to);
            }
            params.distance                                 = params.to - from;
            aRD.$w.data('aoWindowScroll', setTimeout(func, params.delay));
        }
    ;
    aRD.scroll                                              = {
        to                                                  : scrollTo,
        parse                                               : function (val){
            return parser.parse(val);
        },
        stringify                                           : function (val){
            return parser.stringify(val);
        }
    };
    aRD.pushFlist('init', function ($container, findFn){
        $container[findFn]('[data-ao-window-scroll]').on('click.aoWindowScroll', function (e){
            var $el                                         = jQuery(this);
            if( $el.is('a') ){
                e.preventDefault();
            }
            scrollTo( parser.parse($el.attr('data-ao-window-scroll')) );
        });
    });
}));