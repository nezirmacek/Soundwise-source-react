/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Animaze Color requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Animaze Color requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    var colorObj                                            = {
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val);
            data.toCurrent                                  = !!val.toCurrent || !val.toColor;
            data.toColor                                    = val.toColor;
            data.fromColor                                  = val.fromColor;
            return data;
        },
        startFn                                             : function ($el, data){
            var css                                         = {},
                current                                     = aRD.type('color').parse(aRD.getStyle($el, data._cssName, 'current'))
            ;
            data.toColor                                    = aRD.color.toRGBA(data.toCurrent ? current : data.toColor, null, data.fromColor, true);
            if( !(data.fromColor && data.toColor) ){
                data.fromColor                              = jQuery.extend({}, current, {a: 0});
            }else{
                data.fromColor                              = aRD.color.toRGBA(data.fromColor || current, null, data.toColor, true);
            }
            
            data._parts                                     = aRD.color.RGBAdiff(data.fromColor, data.toColor);
            aRD.storeStyle($el, data._cssName, data.toColor, 'current');
            if( !data._parts.length ){
                data.duration                               = 0;
                return;
            }
            data._current                                   = jQuery.extend({}, data.fromColor);
            css[data._cssName]                              = aRD.color.stringify(data.fromColor);
            return css;
        },
        stepFn                                              : function ($el, data){
            for (var i = 0; i < data._parts.length; i++) {
                if( data._parts[i] === 'a' ){
                    data._current[data._parts[i]] = aRD.loopRange( aRD.delta(
                        data.fromColor[data._parts[i]],
                        data.toColor[data._parts[i]],
                        data.delta,
                        true
                    ), 0, 1);
                }else{
                    data._current[data._parts[i]] = aRD.loopRange( aRD.delta(
                        data.fromColor[data._parts[i]],
                        data.toColor[data._parts[i]],
                        data.delta
                    ), 0, 255);
                }
                
            }
            var
                css                                         = {},
                color                                       = aRD.color.stringify(data._current)
            ;
            if( data._color !== color ){
                data._color                                 = color;
                css[data._cssName]                          = color;
            }
            return css;
        },
        finishFn                                            : function ($el, data){
            var css                                         = {};
            css[data._cssName]                              = aRD.color.stringify(data.toColor);
            aRD.storeStyle($el, data._cssName, css[data._cssName], 'current');
            return css;
        },
        properties                                          : [
            aRD.parser.newPropertyCheck({
                checks                                          : [ aRD.parser.newCheck('toColor', 'color'),
                    {
                        name                                        : 'toCurrent',
                        allowed                                     : ['current', true],
                        parser                                      : function (value){ return value === 'current'; },
                        stringifier                                 : function (value){ return value ? 'current' : ''; }
                    }
                ]
            }),
            aRD.parser.newPropertyCheck({
                checks                                          : aRD.parser.newCheck('fromColor', 'color')
            })  
        ]
    };
    aRD.animation.type('bgColor', $.extend({
        data                                                    : {
            _cssName                                                : 'backgroundColor'
        }
    }, colorObj));
    aRD.animation.type('tColor', $.extend({
        data                                                    : {
            _cssName                                                : 'color'
        }
    }, colorObj));
}));