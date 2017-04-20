/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Animaze Transform requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Animaze Transform requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    var transformCSS                                        = [
            'rotate', 'sizeScale', 'scale', 'perspective',
            'rotateX', 'rotateY', 'rotateZ',
            'scaleX', 'scaleY', 'scaleZ',
            'skewX', 'skewY',
            'translateX', 'translateY', 'translateZ'],
        transformExt                                        = {
            'rotate'                                        : 'deg',
            'rotateX'                                       : 'deg',
            'rotateY'                                       : 'deg',
            'rotateZ'                                       : 'deg',
            'scaleX'                                        : '',
            'scaleY'                                        : '',
            'scaleZ'                                        : '',
            'skewX'                                         : 'deg',
            'skewY'                                         : 'deg',
            'translateX'                                    : '',
            'translateY'                                    : '',
            'translateZ'                                    : '',
            'perspective'                                   : 'px'
        },
        transformOriginCSS                                  = ['transformOrigin', 'transformOriginX', 'transformOriginY', 'transformOriginZ'],
        getElementTransform                                 = function ($el){
            return aRD.getData($el, 'aocss__transform', {});
        },
        getElementTransformOrigin                           = function ($el){
            return aRD.getData($el, 'aocss___transformOrigin', {});
        },
        skewAxis                                            = ['X', 'Y']
    ;

    aRD.getElementTransform                                 = getElementTransform;

    aRD.animation.type('perspective', {
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val);
            data.to                                         = val.range && val.range.from ? val.range.from.value : false;
            data.from                                       = val.range && val.range.to ? val.range.to.value : false;
            return data;
        },
        startFn                                             : function ($el, data){
            if( !data.duration ){
                return;
            }
            if( data.from === false ){
                var transform                               = getElementTransform($el);
                data.from                                   = {
                    value           : transform.perspective || transform.perspective === 0 ? transform.perspective : 0
                };
            }
            data.perc                                       = data.to - data.from;
            if( !data.perc ){
                data.duration                               = 0;
                return;
            }

            return {
                perspective                                 : data.from
            };
        },
        stepFn                                              : function ($el, data){
            return data.perc ? {
                perspective                                 : data.from + (data.perc * data.delta)
            } : null;
        },
        finishFn                                            : function ($el, data){
            return data.to ? {
                perspective                                 : data.to
            } : null;
        },
        properties                                          : [
            { checks                                            : aRD.parser.newCheck('range', 'sizeRange') },
        ]
    });
    aRD.animation.type('rotate',{
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val),
                i , axis, range
            ;
            data.times                                      = aRD.toNumber(val.times, 2);
            data.multiply                                   = val.direction === 'left' ? 1 : -1;
            data.axis                                       = ['X'];
            switch(val.type){
                case 'rotateX':
                case 'X':
                    data._css                               = {
                        rangeX                              : 'rotateX'
                    };
                    break;
                case 'rotateY':
                case 'Y':
                    data._css                               = {
                        rangeX                              : 'rotateY'
                    };
                    break;
                case 'rotateZ':
                case 'Z':
                    data._css                               = {
                        rangeX                              : 'rotateZ'
                    };
                    break;
                case 'rotateXY':
                case 'XY':
                    data._css                               = {
                        rangeX                              : 'rotateX',
                        rangeY                              : 'rotateY'
                    };
                    data.axis                               = ['X', 'Y'];
                    break;
                case 'rotate3D':
                case '3D':
                    data._css                               = {
                        rangeX                              : 'rotateX',
                        rangeY                              : 'rotateY',
                        rangeZ                              : 'rotateZ',
                    };
                    data.axis                               = ['X', 'Y', 'Z'];
                    break;
                default:
                    data._css                               = {
                        rangeX                              : 'rotate'
                    };
                    break;
            }
            for (i = 0; i < data.axis.length; i++) {
                axis                                        = data.axis[i];
                range                                       = val['range' + axis] || {from: 0};
                data['toVal' + axis]                        = aRD.toNumber(range.from, 0);
                data['fromVal' + axis]                      = typeof(range.to) === 'number' ? range.to : null;
            }
            return data;
        },
        startFn                                             : function ($el, data){
            if( !data.duration ){
                return;
            }
            var css                                         = {},
                transform                                   = getElementTransform($el),
                cssName, axis, i;
            data.dynamic                                    = [];
            for (i = 0; i < data.axis.length; i++) {
                axis                                        = data.axis[i];
                if(data['fromVal' + axis] === null){
                    cssName                                 = data._css['range' + data.axis[i]];
                    data['fromVal' + axis]                  = transform[cssName] || transform[cssName] === 0 ? transform[cssName] : 0;
                }
                data['fixFrom' + axis]                      = data['fromVal' + axis] + data.multiply * 360 * data.times;

                data['perc' + axis]                         = data['toVal' + axis] - data['fixFrom' + axis];
                if( data['perc' + axis] ){
                    data.dynamic.push(axis);
                    css['range' + axis]                     = data['fixFrom' + axis];
                }else{
                    css['range' + axis]                     = data['toVal' + axis];
                }
            }
            if( !data.dynamic.length ){
                data.duration                               = 0;
                return;
            }
            return aRD.createByObject(css, data._css );
        },
        stepFn                                              : function ($el, data){
            var css                                         = {};
            for (var i = 0; i < data.dynamic.length; i++) {
                css['range' + data.dynamic[i]]              = data['fixFrom' + data.dynamic[i]] + (data['perc' + data.dynamic[i]] * data.delta);
            }
            return aRD.createByObject(css, data._css );
        },
        finishFn                                            : function ($el, data){
            var css                                         = {};
            for (var i = 0; i < data.axis.length; i++) {
                css['range' + data.axis[i]]                 = data['toVal' + data.axis[i]];
            }
            return aRD.createByObject(css, data._css );
        },
        properties                                          : [
            { checks                                        : aRD.parser.newCheck('times', 'number') },
            { checks                                        : {
                name                                            : 'direction',
                allowed                                         : ['left', 'right']
            } },
            { checks                                        : {
                name                                            : 'type',
                allowed                                         : ['rotateX', 'rotateY', 'rotateZ', 'rotateXY', 'rotate3D', 'X', 'Y', 'Z', 'XY', '3D']
            } },
            { checks                                        : aRD.parser.newCheck('rangeX', 'degreeRange') },
            { checks                                        : aRD.parser.newCheck('rangeY', 'degreeRange') },
            { checks                                        : aRD.parser.newCheck('rangeZ', 'degreeRange') }
        ]
    });
    aRD.animation.type('scale', {
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val),
                i , axis, range;
            data.axis                                       = ['X'];
            switch(val.type){
                case 'scaleX':
                case 'X':
                    data._css                               = {
                        rangeX                              : 'scaleX'
                    };
                    break;
                case 'scaleY':
                case 'Y':
                    data._css                               = {
                        rangeX                              : 'scaleY'
                    };
                    break;
                case 'scaleZ':
                case 'Z':
                    data._css                               = {
                        rangeX                              : 'scaleZ'
                    };
                    break;
                case 'scaleXY':
                case 'XY':
                    data._css                               = {
                        rangeX                              : 'scaleX',
                        rangeY                              : 'scaleY'
                    };
                    data.axis                               = ['X', 'Y'];
                    break;
                case 'scale3D':
                case '3D':
                    data._css                               = {
                        rangeX                              : 'scaleX',
                        rangeY                              : 'scaleY',
                        rangeZ                              : 'scaleZ',
                    };
                    data.axis                               = ['X', 'Y', 'Z'];
                    break;
                default:
                    data._css                               = {
                        rangeX                              : 'scaleX',
                        rangeY                              : 'scaleY'
                    };
                    val.rangeY                              = val.rangeX;
                    data.axis                               = ['X', 'Y'];
                    break;
            }
            for (i = 0; i < data.axis.length; i++) {
                axis                                        = data.axis[i];
                range                                       = val['range' + axis] || {from: 100};
                
                data['toVal' + axis]                        = aRD.toNumber(range.from, 100) / 100;
                data['fromVal' + axis]                      = typeof(range.to) === 'number' ? aRD.toNumber(range.to, 0) / 100 : null;
            }
            return data;
        },
        startFn                                             : function ($el, data){
            if( !data.duration ){
                return;
            }
            var css                                         = {},
                transform                                   = getElementTransform($el),
                cssName, axis, i;
            data.dynamic                                    = [];
            for (i = 0; i < data.axis.length; i++) {
                axis                                        = data.axis[i];
                if(data['fromVal' + axis] === null){
                    cssName                                 = data._css['range' + data.axis[i]];
                    data['fromVal' + axis]                  = transform[cssName] || transform[cssName] === 0 ? transform[cssName] : (data['toVal' + axis] ? 0 : 1);
                }
                data['perc' + axis]                         = data['toVal' + axis] - data['fromVal' + axis];
                if( data['perc' + axis] ){
                    data.dynamic.push(axis);
                    css['range' + axis]                     = data['fromVal' + axis];
                }else{
                    css['range' + axis]                     = data['toVal' + axis];
                }
            }
            if( !data.dynamic.length ){
                data.duration                               = 0;
                return;
            }
            return aRD.createByObject(css, data._css );
        },
        stepFn                                              : function ($el, data){
            var css                                         = {},
                i;
            for (i = 0; i < data.dynamic.length; i++) {
                css['range' + data.dynamic[i]]              = data['fromVal' + data.dynamic[i]] + (data['perc' + data.dynamic[i]] * data.delta);
            }
            return aRD.createByObject(css, data._css );
        },
        finishFn                                            : function ($el, data){
            var css                                         = {},
                i;
            for (i = 0; i < data.axis.length; i++) {
                css['range' + data.axis[i]]                 = data['toVal' + data.axis[i]];
            }
            return aRD.createByObject(css, data._css );
        },
        properties                                          : [
            { checks                                            : {
                name                                                : 'type',
                allowed                                             : ['scaleX', 'scaleY', 'scaleZ', 'scaleXY', 'scale3D', 'X', 'Y', 'Z', 'XY', '3D']
            } },
            { checks                                            : aRD.parser.newCheck('rangeX', 'percentRange') },
            { checks                                            : aRD.parser.newCheck('rangeY', 'percentRange') },
            { checks                                            : aRD.parser.newCheck('rangeZ', 'percentRange') }
        ]
    });
    aRD.animation.type('translate', {
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val),
                i , axis, range
            ;
            data.axis                                       = ['X'];
            switch(val.type){
                case 'translateX':
                case 'X':
                    data._css                               = {
                        rangeX                              : 'translateX'
                    };
                    break;
                case 'translateY':
                case 'Y':
                    data._css                               = {
                        rangeX                              : 'translateY'
                    };
                    break;
                case 'translateZ':
                case 'Z':
                    data._css                               = {
                        rangeX                              : 'translateZ'
                    };
                    break;
                case 'translateXY':
                case 'XY':
                    data._css                               = {
                        rangeX                              : 'translateX',
                        rangeY                              : 'translateY'
                    };
                    data.axis                               = ['X', 'Y'];
                    break;
                case 'translate3D':
                case '3D':
                    data._css                               = {
                        rangeX                              : 'translateX',
                        rangeY                              : 'translateY',
                        rangeZ                              : 'translateZ',
                    };
                    data.axis                               = ['X', 'Y', 'Z'];
                    break;
                default:
                    data._css                               = {
                        rangeX                              : 'translateX',
                        rangeY                              : 'translateY'
                    };
                    val.rangeY                              = val.rangeX;
                    data.axis                               = ['X', 'Y'];
                    break;
            }
            for (i = 0; i < data.axis.length; i++) {
                axis                                        = data.axis[i];
                range                                       = val['range' + axis] || {
                    from                                    : {
                        value                                   : 0,
                        type                                    : 'px'
                    }
                };
                
                data['toVal' + axis]                        = range.from;
                data['fromVal' + axis]                      = typeof(range.to) !== 'undefined' ? range.to : null;
            }
            return data;
        },
        startFn                                             : function ($el, data){
            if( !data.duration ){
                return;
            }
            var css                                         = {},
                transform                                   = getElementTransform($el),
                cssName, axis, i;
            data.dynamic                                    = [];
            for (i = 0; i < data.axis.length; i++) {
                axis                                        = data.axis[i];
                if(data['fromVal' + axis] === null){
                    cssName                                 = data._css['range' + data.axis[i]];
                    data['fromVal' + axis]                  = transform[cssName] || transform[cssName] === 0 ? aRD.type('size').parse(transform[cssName]) : data['toVal' + axis];
                }
                if( data['toVal' + axis].value === 0 ){
                    data['toVal' + axis].type               = data['fromVal' + axis].type;
                }
                if( data._css['range' + axis] === 'translateY' ){
                    aRD.parentHeightToType($el, data['fromVal' + axis], data['toVal' + axis].type);
                }else if( data._css['range' + axis] === 'translateX' ){
                    aRD.parentWidthToType($el, data['fromVal' + axis], data['toVal' + axis].type);
                }else{
                    data['fromVal' + axis].type = 'px';
                    data['toVal' + axis].type               = 'px';
                }
                data['perc' + axis]                         = data['toVal' + axis].value - data['fromVal' + axis].value;
                if( data['perc' + axis] ){
                    data.dynamic.push(axis);
                    css['range' + axis]                     = data['fromVal' + axis].value + data['fromVal' + axis].type;
                }else{
                    css['range' + axis]                     = data['toVal' + axis].value + data['fromVal' + axis].type;
                }
            }
            if( !data.dynamic.length ){
                data.duration                               = 0;
                return;
            }
            return aRD.createByObject(css, data._css );
        },
        stepFn                                              : function ($el, data){
            var css                                         = {},
                i;
            for (i = 0; i < data.dynamic.length; i++) {
                css['range' + data.dynamic[i]]              = (data['fromVal' + data.dynamic[i]].value + (data['perc' + data.dynamic[i]] * data.delta)) + data['fromVal' + data.dynamic[i]].type;
            }
            return aRD.createByObject(css, data._css );
        },
        finishFn                                            : function ($el, data){
            var css                                         = {},
                i;
            for (i = 0; i < data.axis.length; i++) {
                css['range' + data.axis[i]]                 = data['toVal' + data.axis[i]].value + data['toVal' + data.axis[i]].type;
            }
            return aRD.createByObject(css, data._css );
        },
        properties                                          : [
            { checks                                            : {
                name                                                : 'type',
                allowed                                             : ['translateX', 'translateY', 'translateZ', 'translateXY', 'translate3D', 'X', 'Y', 'Z', 'XY', '3D']
            } },
            { checks                                            : aRD.parser.newCheck('rangeX', 'sizeRange') },
            { checks                                            : aRD.parser.newCheck('rangeY', 'sizeRange') },
            { checks                                            : aRD.parser.newCheck('rangeZ', 'sizeRange') }
        ]
    });
    aRD.animation.type('skew', {
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val),
                i , axis
            ;
            for (i = 0; i < skewAxis.length; i++) {
                axis                                        = skewAxis[i];
                if( val['range' + axis] ){
                    data['has' + axis]                      = true;
                    data['toDegree' + axis]                 = aRD.toNumber(val['range' + axis].from, 0);
                    data['fromDegree' + axis]               = aRD.toNumber(val['range' + axis].to);
                }
            }
            return data;
        },
        startFn                                             : function ($el, data){
            var css                                         = {},
                transform                                   = getElementTransform($el),
                axis, i
            ;
            data.skews                                      = [];
            for (i = 0; i < skewAxis.length; i++) {
                axis                                        = skewAxis[i];
                if( data['fromDegree' + axis] === null ){
                    data['fromDegree' + axis]               = transform['skew' + axis] || transform['skew' + axis] === 0 ? transform['skew' + axis] : 10;
                }
                if( data['has' + axis] ){
                    data['perc' + axis]                     = data['toDegree' + axis] - data['fromDegree' + axis];
                    if( data['perc' + axis] ){
                        data.skews.push(axis);
                        css['skew' + axis]                  = data['fromDegree' + axis];
                    }
                }
            }
            if( !data.skews.length ){
                data.duration                               = 0;
                return;
            }
            return css;
        },
        stepFn                                              : function ($el, data){
            var css                                         = {},
                i;
            for (i = 0; i < data.skews.length; i++) {
                css['skew' + data.skews[i]]                 = data['fromDegree' + data.skews[i]] + (data['perc' + data.skews[i]] * data.delta);
            }
            return css;
        },
        finishFn                                            : function ($el, data){
            var css                                         = {},
                i;
            for (i = 0; i < skewAxis.length; i++) {
                if( data['has' + skewAxis[i]] ){
                    css['skew' + skewAxis[i]]               = data['toDegree' + skewAxis[i]];
                }
            }
            return css;
        },
        properties                                          : [
            { checks                                            : aRD.parser.newCheck('rangeX', 'degreeRange') },
            { checks                                            : aRD.parser.newCheck('rangeY', 'degreeRange') }
        ]
    });
    aRD.animation.type('fitscale', {
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val);
            if( val.height || val.width ){
               if( val.height ){
                    if( val.height.from ){
                        data.fromHeight                     = val.height.from;
                    }
                    if( val.height.to ){
                        data.toHeight                       = val.height.to;
                    }
                }
                if( val.width ){
                    if( val.width.from ){
                        data.fromWidth                      = val.width.from;
                    }
                    if( val.width.to ){
                        data.toWidth                        = val.width.to;
                    }
                }
            }
            return data;
        },
        startFn                                             : function ($el, data){
            var
                size                                        = aRD.getWindowSize(),
                scales                                      = [],
                tmp
            ;
            if( !(data.fromHeight || data.fromWidth) ){
                tmp                                         = $el.outerHeight();
                data.fromHeight                             = tmp + aRD.inRange( Math.floor(tmp * 0.1), 50, 100 );
                tmp                                         = $el.outerWidth();
                data.fromWidth                              = tmp + aRD.inRange( Math.floor(tmp * 0.1), 50, 100 );
            }
            if( data.fromHeight && size.height < data.fromHeight ){
                scales.push( size.height / data.fromHeight );
            }
            if( data.fromWidth && size.width < data.fromWidth ){
                scales.push( size.width / data.fromWidth );
            }

            if( !scales.length ){
                if( data.toHeight && size.height > data.toHeight ){
                    scales.push( size.height / data.toHeight );
                }
                if( data.toWidth && size.width > data.toWidth ){
                    scales.push( size.width / data.toWidth );
                }
            }

            return {
                sizeScale                                   : scales.length ? Math.min.apply(Math, scales) : 1
            };
        },
        properties                                          : [
            { checks                                            : aRD.parser.newCheck('width', 'range') },
            { checks                                            : aRD.parser.newCheck('height', 'range') }
        ]
    }, false, false, false);
    aRD.animation.type('transformOrigin', {
        checkFn                                             : function (data){
            return !!(data.height || data.width);
        },
        dataFn                                              : function (val){
            var data                                        = aRD.animation.data(val);
            data._css                                       = {};
            if( val.height ){
                if( val.height.from ){
                    data.toHeight                           = val.height.from;
                }
                if( val.height.to ){
                    data.fromHeight                         = val.height.to;
                }
                data._css.height                            = 'transformOriginY';
            }
            if( val.width ){
                if( val.width.from ){
                    data.toWidth                            = val.width.from;
                }
                if( val.width.to ){
                    data.fromWidth                          = val.width.to;
                }
                data._css.width                             = 'transformOriginX';
            }
            if( val.distance ){
                if( val.distance.from ){
                    data.toDistance                         = val.distance.from;
                }
                if( val.distance.to ){
                    data.fromDistance                       = val.distance.to;
                }
                data._css.distance                          = 'transformOriginZ';
            }
            return data;
        },
        startFn                                             : function ($el, data){
            if( !data.duration ){
                return;
            }
            var obj                                         = getElementTransformOrigin($el);
            data._parts                                     = [];
            data._uparts                                    = [];
            data._current                                   = {};
            if( data.toHeight ){
                if( !data.fromHeight ){
                    data.fromHeight                         = obj.transformOriginY || {
                        value                               : 50,
                        type                                : '%'
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
                    data.fromWidth                          = obj.transformOriginX || {
                        value                               : 50,
                        type                                : '%'
                    };
                }
                aRD.parentWidthToType($el, data.fromWidth, data.toWidth.type);
                data._current.width                         = jQuery.extend({}, data.fromWidth);
                if( data.fromWidth.value !== data.toWidth.value ){
                    data._parts.push('width');
                    data._uparts.push('Width');
                }
            }
            if( data.toDistance ){
                if( !data.fromDistance ){
                    data.fromDistance                       = obj.transformOriginX || {
                        value                               : 0,
                        type                                : 'px'
                    };
                }
                data._current.distance                      = jQuery.extend({}, data.fromDistance);
                if( data.fromDistance.value !== data.toDistance.value ){
                    data._parts.push('distance');
                    data._uparts.push('Distance');
                }
            }
            if( !data._parts.length ){
                data.duration                               = 0;
            }
            return aRD.createByObject(data._current, data._css);
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
            return aRD.createByObject(data._current, data._css);
        },
        finishFn                                            : function ($el, data){
            return aRD.createByObject({
                'height'                                    : data.toHeight,
                'width'                                     : data.toWidth,
                'distance'                                  : data.toDistance
            }, data._css );
        },
        aliases                                             : 'transitionOrigin',
        properties                                          : [
            { checks                                            : aRD.parser.newCheck('width', 'sizeRange')},
            { checks                                            : aRD.parser.newCheck('height', 'sizeRange')},
            { checks                                            : aRD.parser.newCheck('distance', 'sizeRange')}
        ]
    });
    aRD.addStyling(transformCSS, function ($el, css, styles){
        var obj                                             = getElementTransform($el),
            i
        ;
        for (i = 0; i < transformCSS.length; i++) {
            if( typeof( styles[ transformCSS[i] ] ) !== 'undefined' ){
                obj[ transformCSS[i] ]                      = styles[ transformCSS[i] ];
                delete styles[ transformCSS[i] ];
            }
        }

        if( obj.transform ){
            css.transform                                   = css.transform;
            $el.data('aocss__transform', {});
        }else{
            var cssObj                                      = [],
                has                                         = {},
                valObj                                      = jQuery.extend({}, obj)
            ;
            for(i in obj){
                if( obj.hasOwnProperty(i) && typeof(obj[i]) !== 'undefined' ){
                    has[i]                                  = true;
                }
            }
            if( has.rotate && (has.rotateX || has.rotateY || has.rotateZ) ){
                has.rotateZ                                 = has.rotate;
                valObj.rotateZ                              = obj.rotate;
            }
            if( has.scale ){
                if( !has.scaleX ){
                    has.scaleX                              = true;
                    valObj.scaleX                           = obj.scale;
                }
                if( !has.scaleY ){
                    has.scaleY                              = true;
                    valObj.scaleY                           = obj.scale;
                }
                delete has.scale;
            }
            if( has.sizeScale ){
                valObj.scaleX                               = (has.scaleX ? obj.scaleX : 1) * (obj.sizeScale || 1);
                valObj.scaleY                               = (has.scaleY ? obj.scaleY : 1) * (obj.sizeScale || 1);
                has.scaleX = has.scaleY                     = true;
                delete has.sizeScale;
            }
            jQuery.each(has, function (key){
                cssObj.push(key + '(' + valObj[key] + transformExt[key] + ')');
            });
            css.transform                                   = cssObj.join(' ');
        }
    });
    
    aRD.addStyling(transformOriginCSS, function ($el, css, styles){
        var obj                                             = getElementTransformOrigin($el),
            i
        ;
        for (i = 0; i < transformOriginCSS.length; i++) {
            if( typeof( styles[ transformOriginCSS[i] ] ) !== 'undefined' ){
                obj[ transformOriginCSS[i] ]                = styles[ transformOriginCSS[i] ];
                delete styles[ transformOriginCSS[i] ];
            }
        }

        if( obj.transformOrigin ){
            css.transformOrigin                             = css.transformOrigin;
            $el.data('aocss___transformOrigin', {});
        }else{
            css.transformOrigin                             = (obj.transformOriginX ? obj.transformOriginX.value + obj.transformOriginX.type : '50%') + ' ' +
                (obj.transformOriginY ? obj.transformOriginY.value + obj.transformOriginY.type : '50%') + ' ' + (obj.transformOriginZ ? obj.transformOriginZ.value + 'px' : 0)
            ;
        }
    });
}));