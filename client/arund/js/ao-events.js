/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (aRD){
    var triggerChange                                   = function ($els){
            $els.each(function (i, el){
                var $el                                 = jQuery(el);
                if( $el.is('[type="checkbox"], [type="radio"]') ){
                    if( $el.data('aoChange__previous') !== $el.prop('checked') ){
                        $el
                            .data('aoChange__previous', $el.prop('checked'))
                            .trigger('aoChange')
                        ;
                    }
                }else if( $el.is('option') ){
                    if( $el.data('aoChange__previous') !== $el.prop('selected') ){
                        $el
                            .data('aoChange__previous', $el.prop('selected'))
                            .trigger('aoChange')
                        ;
                    }
                }else if( $el.is('textarea') || ( $el.is('input') && $el.is(':not([type="button"]), :not([type="submit"])') ) ){
                    if( $el.data('aoChange__previous') !== $el.val() ){
                        $el
                            .data('aoChange__previous', $el.val())
                            .trigger('aoChange')
                        ;
                    }
                }else{
                    $el.trigger('aoChange');
                }
            });
        },
        emitEvent                                       = function ($el, event, params, props){
            var e                                       = jQuery.Event( event, props );
            $el.triggerHandler(e, params);
            if( !e.isPropagationStopped() ){
                $el.find('> *').each(function(i, el){
                    emitEvent(jQuery(el), event, params, props);
                });
            }
        }
    ;
    jQuery.fn.aoEmit                                    = function (event, params, props){
        jQuery(this).each(function(i, el){
            emitEvent(jQuery(el), event, params, jQuery.extend(true, {
                target                                  : el
            }, props || {}));
        });
        return this;
    };
    jQuery.fn.aoTriggerChange                           = function (){
        var
            $els                                        = jQuery(this),
            $radios                                     = $els.filter('[type="radio"]')
        ;
        $els                                            = $els.not($radios);
        triggerChange($els);
        $radios.each(function (i, $el){
            $el                                         = jQuery($el);
            triggerChange($el.closest('form, body').find('[name="' + $el.attr('name') + '"]'));
        });
        return this;
    };
    jQuery.event.special.aoChange       = {
        setup       : function (opts){
            var
                $el                     = jQuery(this),
                prevent                 = true
            ;
            opts                        = jQuery.extend(opts || {}, {
                preventDefault      : true,
                preventOnlyLink     : false
            });
            if( (opts.preventOnlyLink && !$el.is('a')) || !opts.preventDefault ){
                prevent                 = false;
            }

            if( $el.is('[type="checkbox"]') ){
                $el.on('click.aoChangeFunc', function (){
                    $el.aoTriggerChange();
                });
            }else if( $el.is('[type="radio"]') ){
                $el.closest('form, body')
                    .find('input[name="' + $el.attr('name') +'"]')
                    .filter('[type="radio"]')
                    .add($el)
                    .off('.aoChangeFunc')
                    .on('click.aoChangeFunc', function (){
                        jQuery(this).aoTriggerChange();
                    })
                ;
            }else if( $el.is('option') ){
                $el.on('click.aoChangeFunc', function (e){
                    e.stopPropagation();
                    $el.trigger('aoChange');
                });
                var $sel                = $el.closest('select');
                if( !$sel.data('changeOpts') ){
                    $sel.on('change.aoChangeFunc', function (){
                        $sel.data('changeOpts').filter(':selected').trigger('aoChange');
                    });
                }
                $sel.data('changeOpts', ($sel.data('changeOpts') || jQuery([])).add($el) );
            }else if( $el.is('textarea') || ( $el.is('input') && $el.is(':not([type="button"]), :not([type="submit"])') ) ){
                $el.on('blur.aoChangeFunc', function (){
                    $el.trigger('aoChange');
                });
            }else{
                $el.on('click.aoChangeFunc', function (e){
                    if( prevent ){
                        e.preventDefault();
                    }
                    $el.trigger('aoChange');
                });
            }
        },
        teardown    : function () {
            var $el                     = jQuery(this);
            $el.off('.aoChangeFunc');
            if( $el.is('option') ){
                var
                    $sel                = $el.closest('select'),
                    $els                = ($sel.data('changeOpts') || jQuery([])).not($el)
                ;
                if( $els.length ){
                    $el.closest('select').data('changeOpts', $els );
                }else{
                    $sel.off('.aoChangeFunc');
                }
            }
        }
    };

    var _clickOutIds                    = {};

    jQuery.event.special.aoClickOut     = {
        setup       : function (){
            var $el                     = jQuery(this),
                id                      = aRD.randomId(_clickOutIds)
            ;
            _clickOutIds[id]            = true;
            $el.data('aoClickOut__id', id);
            aRD.$doc.on('click.aoClickOut_' + id, function (event) { 
                if(!jQuery(event.target).closest($el).length) {
                    $el.triggerHandler('aoClickOut');
                }        
            });
        },
        teardown    : function () {
            var id                      = jQuery(this).data('aoClickOut__id');
            aRD.$doc.off('click.aoClickOut_' + id);
            delete _clickOutIds[id];
        }
    };

    jQuery.event.special.destroyproxy                   = {
        //only triggered when element is trully be removed
        remove                                          : function (){
            var
                $el                                     = jQuery(this),
                funcs                                   = $el.data('aoDestroyProxyFunc')
            ;
            if( funcs ){
                jQuery.each(funcs, function (i, func){
                    func.apply($el[0], []);
                });
            }
        }
    };
    jQuery.event.special.destroyed                      = {
        add                                             : function (o){
            if (o.handler) {
                var
                    $el                                 = jQuery(this),
                    funcs                               = $el.data('aoDestroyProxyFunc') || {}
                ;
                funcs[o.guid]                           = o.handler;
                $el.data('aoDestroyProxyFunc', funcs );
                if( !$el.data('hasDestroyProxy') ){
                    $el.data('hasDestroyProxy', true);
                    $el.on('destroyproxy', function (){});
                }
            }
        },
        remove                                          : function (o) {
            if (o.handler) {
                setTimeout( function (){
                    var
                        $el                             = jQuery(this),
                        funcs                           = $el.data('aoDestroyProxyFunc')
                    ;
                    if( funcs && funcs[o.guid] ){
                        delete funcs[o.guid];
                    }
                    $el.data('aoDestroyProxyFunc', funcs );
                }, 0 );
            }
        }
    };
})(aRunD);