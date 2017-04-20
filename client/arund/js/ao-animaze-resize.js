/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Animaze Resize requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Animaze Resize requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    var provideMinMax                                       = function (data, val){
            switch( val.minMax ){
                case 'min' :
                    data._css                               = {
                        height                              : 'minHeight',
                        width                               : 'minWidth'
                    };
                    break;
                case 'max' :
                    data._css                               = {
                        height                              : 'maxHeight',
                        width                               : 'maxWidth'
                    };
                    break;
                default :
                    data._css                               = {
                        height                              : 'height',
                        width                               : 'width'
                    };
                    break;
            }
            if( val.heightRange ){
                data.heightRange                            = val.heightRange;
            }
            if( val.widthRange ){
                data.widthRange                             = val.widthRange;
            }
        },
        checkSize                                           = function (data, $el, size){
            if( data.heightRange ){
                size.heightRange                            = data.heightRange;
            }
            if( data.widthRange ){
                size.widthRange                             = data.widthRange;
            }
            return size;
        }
    ;
    aRD.animation.type('windowSize', {
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val);
            if( val.width ){
                data.width                                  = val.width === true ? 1 : aRD.toNumber( val.width ) / 100;
            }
            if( val.height ){
                data.height                                 = val.height === true ? 1 : aRD.toNumber( val.height ) / 100;
            }
            provideMinMax(data, val);
            return data;
        },
        stepFn                                              : function ($el, data){
            return checkSize( data, $el,
                aRD.getWindowSizePartCss(
                    data.width ? data.width * data.delta : null,
                    data.height ? data.height * data.delta : null,
                    data._css
                )
            );
        },
        finishFn                                            : function ($el, data){
            return checkSize( data, $el, aRD.getWindowSizePartCss(data.width, data.height, data._css) );
        },
        properties                                          : [
            { checks : {
                name    : 'minMax',
                allowed : ['min', 'max']
            }},
            { checks : aRD.parser.newCheck('height', 'percent')},
            { checks : aRD.parser.newCheck('width', 'percent')},
            { checks : [aRD.parser.check('heightRange'), aRD.parser.check('fitHeight')]},
            { checks : [aRD.parser.check('widthRange'), aRD.parser.check('fitWidth')]}
        ]
    });

    aRD.animation.type('resize', {
        checkFn                                             : function (val){
            return !!(val.height || val.width);
        },
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val);
            if( val.height ){
                if( val.height.from ){
                    data.toHeight                           = val.height.from;
                }
                if( val.height.to ){
                    data.fromHeight                         = val.height.to;
                }
            }
            if( val.width ){
                if( val.width.from ){
                    data.toWidth                            = val.width.from;
                }
                if( val.width.to ){
                    data.fromWidth                          = val.width.to;
                }
            }
            provideMinMax(data, val);
            return data;
        },
        startFn                                             : function ($el, data){
            if( !data.duration ){
                return;
            }
            data._parts                                     = [];
            data._uparts                                    = [];
            data._current                                   = {};
            if( data.toHeight ){
                if( !data.fromHeight ){
                    data.fromHeight                         = {
                        value                               : $el.height(),
                        type                                : 'px'
                    };
                }
                aRD.parentHeightToType($el, data.fromHeight, data.toHeight.type);
                data._current.height                        = jQuery.extend({}, data.fromHeight);
                if( data.fromHeight.value !== data.toHeight.value ){
                    data._parts.push('height');
                    data._uparts.push('Height');
                }
            }
            if( data.toWidth ){
                if( !data.fromWidth ){
                    data.fromWidth                          = {
                        value                               : $el.width(),
                        type                                : 'px'
                    };
                }
                aRD.parentWidthToType($el, data.fromWidth, data.toWidth.type);
                data._current.width                         = jQuery.extend({}, data.fromWidth);
                if( data.fromWidth.value !== data.toWidth.value ){
                    data._parts.push('width');
                    data._uparts.push('Width');
                }
            }
            if( !data._parts.length ){
                data.duration                               = 0;
            }
            return checkSize( data, $el, aRD.createByObject(data._current, data._css) );
        },
        stepFn                                              : function ($el, data){
            var tmp;
            for (var i = 0; i < data._parts.length; i++) {
                tmp                                         = aRD.ucfirst(data._parts[i]);
                data._current[data._parts[i]].value = aRD.delta(
                    data['from' + data._uparts[i]].value,
                    data['to' + data._uparts[i]].value,
                    data.delta,
                    true
                );
            }
            return checkSize( data, $el, aRD.createByObject(data._current, data._css) );
        },
        finishFn                                            : function ($el, data){
            return checkSize( data, $el, aRD.createByObject({
                'height'                                    : data.toHeight,
                'width'                                     : data.toWidth
            }, data._css) );
        },
        properties                              : [
            { checks : {
                name    : 'minMax',
                allowed : ['min', 'max']
            }},
            { checks : aRD.parser.newCheck('height', 'sizeRange')},
            { checks : aRD.parser.newCheck('width', 'sizeRange')},
            { checks : [aRD.parser.check('heightRange'), aRD.parser.check('fitHeight')]},
            { checks : [aRD.parser.check('widthRange'), aRD.parser.check('fitWidth')]}
        ]
    });
    aRD.pushFlist('init', function ($container, findFn){
        if( $container[findFn]('[data-ao-animaze-resize]').length ){
            aRD.runResize();
            $container[findFn]('img[data-ao-animaze-resize]').off('.aoResizeLoad').on('load.aoResizeLoad aoLoad.aoResizeLoad', function (){
                jQuery(this).aoFindVertical('[data-ao-animaze-resize]').aoAnimazeDelayed('resize');
            });
        }
    });
}));