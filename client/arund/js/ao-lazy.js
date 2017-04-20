/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Lazy requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Lazy requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    var lazyIds                                             = {},
        inView                                              = function (el, off){
            if (typeof jQuery === "function" && el instanceof jQuery) {
                el = el[0];
            }

            var rect                                        = el.getBoundingClientRect(),
                height                                      = (window.innerHeight || document.documentElement.clientHeight) + off,
                width                                       = (window.innerWidth || document.documentElement.clientWidth) + off
            ;

            return (
                (rect.top <= height || rect.bottom <= height) &&
                (rect.left <= width || rect.right <= width)
            );
        }
    ;
    aRD.pushFlist('init', function ($container, findFn){
        $container[findFn]('[data-ao-lazy]:not(.ao-lazy)').each(function (i, el){
            var id                                          = aRD.randomId(lazyIds),
                $el                                         = $(el),
                fn                                          = function (){
                    if( $el.is(':visible') && inView($el, 100) ){
                        var src                             = $el.data('aoLazy');
                        $('[data-ao-lazy="' + src + '"]').triggerHandler('aoLazyLoaded');
                        aRD.loadImage(src)
                            .done(function (src){
                                $('[data-ao-lazy="' + src + '"]').attr('src', src);
                            })
                        ;
                    }
                }
            ;
            lazyIds[id]                                     = true;
            aRD.$w.on('DOMContentLoaded.aoLazy_' + id + ' load.aoLazy_' + id + ' resize.aoLazy_' + id + ' scroll.aoLazy_' + id, fn);
            aRD.$doc.on('aoBlockShow.aoLazy_' + id, fn);
            $el.addClass('ao-lazy').on('aoLazyLoaded', function (){
                aRD.$w.off('.aoLazy_' + id);
                aRD.$doc.off('.aoLazy_' + id);
                $el.off('aoLazyLoaded');
                delete lazyIds[id];
                $el = id = null;
            });
        });
    });
}));