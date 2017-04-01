/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD */

(function(aRD){
    var _transformCSS                               = [
            'rotate', 'sizeScale', 'scale', 'perspective',
            'rotateX', 'rotateY', 'rotateZ',
            'scaleX', 'scaleY', 'scaleZ',
            'skewX', 'skewY',
            'translateX', 'translateY', 'translateZ'],
        _transformExt                               = {
            'rotate'                                : 'deg',
            'rotateX'                               : 'deg',
            'rotateY'                               : 'deg',
            'rotateZ'                               : 'deg',
            'scaleX'                                : '',
            'scaleY'                                : '',
            'scaleZ'                                : '',
            'skewX'                                 : 'deg',
            'skewY'                                 : 'deg',
            'translateX'                            : '',
            'translateY'                            : '',
            'translateZ'                            : '',
            'perspective'                           : 'px'
        },
        _transformOriginCSS                         = ['transformOrigin', 'transformOriginX', 'transformOriginY', 'transformOriginZ'],
        _getElementTransform                        = function($el){
            return aRD.getData($el, 'aocss__transform', {});
        },
        _getElementTransformOrigin                  = function($el){
            return aRD.getData($el, 'aocss___transformOrigin', {});
        }
    ;

    aRD.getElementTransform                         = _getElementTransform;

    aRD.aniAdd('perspective', {
            init                                    : function($el, params){
                this.to                             = params.range && params.range.from ? params.range.from : false;
                this.from                           = params.range && params.range.to ? params.range.to : false;
            },
            start                                   : function($el){
                if( !this.duration ){
                    return;
                }
                if( this.from === false ){
                    var transform                   = _getElementTransform($el);
                    this.from                       = {
                        value   : transform.perspective || transform.perspective === 0 ? transform.perspective : 0
                    };
                }
                this.perc                           = this.to.value - this.from.value;
                if( !this.perc ){
                    this.duration                   = 0;
                    return;
                }

                return {
                    perspective                     : this.from.value
                };
            },
            step                                    : function(){
                return this.perc ? {
                    perspective                         : this.from.value + (this.perc * this.delta)
                } : null;
            },
            finish                                  : function(){
                return this.to ? {
                    perspective                         : this.to.value
                } : null;
            }
        }, {
            list                                    : [
                { byCheck                               : aRD.createTypeCheck('range', 'sizeRange') },
            ]
        });
    aRD.aniAdd('rotate',
        {
            setAxis                                 : function(params){
                var i , axis, range;
                this.axis                           = ['X'];
                switch(params.type){
                    case 'rotateX':
                    case 'X':
                        this._css                   = {
                            rangeX                      : 'rotateX'
                        };
                        break;
                    case 'rotateY':
                    case 'Y':
                        this._css                   = {
                            rangeX                      : 'rotateY'
                        };
                        break;
                    case 'rotateZ':
                    case 'Z':
                        this._css                   = {
                            rangeX                      : 'rotateZ'
                        };
                        break;
                    case 'rotateXY':
                    case 'XY':
                        this._css                   = {
                            rangeX                      : 'rotateX',
                            rangeY                      : 'rotateY'
                        };
                        this.axis                   = ['X', 'Y'];
                        break;
                    case 'rotate3D':
                    case '3D':
                        this._css                   = {
                            rangeX                      : 'rotateX',
                            rangeY                      : 'rotateY',
                            rangeZ                      : 'rotateZ',
                        };
                        this.axis                   = ['X', 'Y', 'Z'];
                        break;
                    default:
                        this._css                   = {
                            rangeX                      : 'rotate'
                        };
                        break;
                }
                for (i = 0; i < this.axis.length; i++) {
                    axis                            = this.axis[i];
                    range                           = params['range' + axis] || {from: 0};
                    this['toVal' + axis]            = aRD.toNumber(range.from, 0);
                    this['fromVal' + axis]          = typeof(range.to) === 'number' ? range.to : null;
                }
            },
            init                                    : function($el, params){
                this.times                          = aRD.toNumber(params.times, 2);
                this.multiply                       = params.direction === 'left' ? 1 : -1;
                this.setAxis(params);
            },
            start                                   : function($el){
                if( !this.duration ){
                    return;
                }
                var css                             = {},
                    transform                       = _getElementTransform($el),
                    cssName, axis, i;
                this.dynamic                        = [];
                for (i = 0; i < this.axis.length; i++) {
                    axis                            = this.axis[i];
                    if(this['fromVal' + axis] === null){
                        cssName                         = this._css['range' + this.axis[i]];
                        this['fromVal' + axis]          = transform[cssName] || transform[cssName] === 0 ? transform[cssName] : 0;
                    }
                    this['fixFrom' + axis]          = this['fromVal' + axis] + this.multiply * 360 * this.times;

                    this['perc' + axis]             = this['toVal' + axis] - this['fixFrom' + axis];
                    if( this['perc' + axis] ){
                        this.dynamic.push(axis);
                        css['range' + axis]         = this['fixFrom' + axis];
                    }else{
                        css['range' + axis]         = this['toVal' + axis];
                    }
                }
                if( !this.dynamic.length ){
                    this.duration                   = 0;
                    return;
                }
                return aRD.createByObject(css, this._css );
            },
            step                                    : function(){
                var css                             = {},
                    i;
                for (i = 0; i < this.dynamic.length; i++) {
                    css['range' + this.dynamic[i]]  = this['fixFrom' + this.dynamic[i]] + (this['perc' + this.dynamic[i]] * this.delta);
                }
                return aRD.createByObject(css, this._css );
            },
            finish                                  : function(){
                var css                             = {},
                    i;
                for (i = 0; i < this.axis.length; i++) {
                    css['range' + this.axis[i]]     = this['toVal' + this.axis[i]];
                }
                return aRD.createByObject(css, this._css );
            }
        }, {
            list                                    : [
                { byCheck                               : aRD.createTypeCheck('times', 'number') },
                { byCheck                               : {
                    name                                    : 'direction',
                    allowed                                 : ['left', 'right']
                } },
                { byCheck                               : {
                    name                                    : 'type',
                    allowed                                 : ['rotateX', 'rotateY', 'rotateZ', 'rotateXY', 'rotate3D', 'X', 'Y', 'Z', 'XY', '3D']
                } },
                { byCheck                               : aRD.createTypeCheck('rangeX', 'degreeRange') },
                { byCheck                               : aRD.createTypeCheck('rangeY', 'degreeRange') },
                { byCheck                               : aRD.createTypeCheck('rangeZ', 'degreeRange') }
            ]
        }
    );
    aRD.aniAdd('scale',
        {
            init                                    : function($el, params){
                var i , axis, range;
                this.axis                           = ['X'];
                switch(params.type){
                    case 'scaleX':
                    case 'X':
                        this._css                   = {
                            rangeX                      : 'scaleX'
                        };
                        break;
                    case 'scaleY':
                    case 'Y':
                        this._css                   = {
                            rangeX                      : 'scaleY'
                        };
                        break;
                    case 'scaleZ':
                    case 'Z':
                        this._css                   = {
                            rangeX                      : 'scaleZ'
                        };
                        break;
                    case 'scaleXY':
                    case 'XY':
                        this._css                   = {
                            rangeX                      : 'scaleX',
                            rangeY                      : 'scaleY'
                        };
                        this.axis                   = ['X', 'Y'];
                        break;
                    case 'scale3D':
                    case '3D':
                        this._css                   = {
                            rangeX                      : 'scaleX',
                            rangeY                      : 'scaleY',
                            rangeZ                      : 'scaleZ',
                        };
                        this.axis                   = ['X', 'Y', 'Z'];
                        break;
                    default:
                        this._css                   = {
                            rangeX                      : 'scaleX',
                            rangeY                      : 'scaleY'
                        };
                        params.rangeY               = params.rangeX;
                        this.axis                   = ['X', 'Y'];
                        break;
                }
                for (i = 0; i < this.axis.length; i++) {
                    axis                            = this.axis[i];
                    range                           = params['range' + axis] || {from: 100};
                    
                    this['toVal' + axis]            = aRD.toNumber(range.from, 100) / 100;
                    this['fromVal' + axis]          = typeof(range.to) === 'number' ? aRD.toNumber(range.to, 0) / 100 : null;
                }
            },
            start                                   : function($el){
                if( !this.duration ){
                    return;
                }
                var css                             = {},
                    transform                       = _getElementTransform($el),
                    cssName, axis, i;
                this.dynamic                        = [];
                for (i = 0; i < this.axis.length; i++) {
                    axis                            = this.axis[i];
                    if(this['fromVal' + axis] === null){
                        cssName                         = this._css['range' + this.axis[i]];
                        this['fromVal' + axis]          = transform[cssName] || transform[cssName] === 0 ? transform[cssName] : (this['toVal' + axis] ? 0 : 1);
                    }
                    this['perc' + axis]             = this['toVal' + axis] - this['fromVal' + axis];
                    if( this['perc' + axis] ){
                        this.dynamic.push(axis);
                        css['range' + axis]         = this['fromVal' + axis];
                    }else{
                        css['range' + axis]         = this['toVal' + axis];
                    }
                }
                if( !this.dynamic.length ){
                    this.duration                   = 0;
                    return;
                }
                return aRD.createByObject(css, this._css );
            },
            step                                    : function(){
                var css                             = {},
                    i;
                for (i = 0; i < this.dynamic.length; i++) {
                    css['range' + this.dynamic[i]]  = this['fromVal' + this.dynamic[i]] + (this['perc' + this.dynamic[i]] * this.delta);
                }
                return aRD.createByObject(css, this._css );
            },
            finish                                  : function(){
                var css                             = {},
                    i;
                for (i = 0; i < this.axis.length; i++) {
                    css['range' + this.axis[i]]     = this['toVal' + this.axis[i]];
                }
                return aRD.createByObject(css, this._css );
            }
        }, {
            list                                    : [
                { byCheck                               : {
                    name                                    : 'type',
                    allowed                                 : ['scaleX', 'scaleY', 'scaleZ', 'scaleXY', 'scale3D', 'X', 'Y', 'Z', 'XY', '3D']
                } },
                { byCheck                               : aRD.createTypeCheck('rangeX', 'percentRange') },
                { byCheck                               : aRD.createTypeCheck('rangeY', 'percentRange') },
                { byCheck                               : aRD.createTypeCheck('rangeZ', 'percentRange') }
            ]
        });
    aRD.aniAdd('translate',
        {
            init                                    : function($el, params){
                var i , axis, range;
                this.axis                           = ['X'];
                switch(params.type){
                    case 'translateX':
                    case 'X':
                        this._css                   = {
                            rangeX                      : 'translateX'
                        };
                        break;
                    case 'translateY':
                    case 'Y':
                        this._css                   = {
                            rangeX                      : 'translateY'
                        };
                        break;
                    case 'translateZ':
                    case 'Z':
                        this._css                   = {
                            rangeX                      : 'translateZ'
                        };
                        break;
                    case 'translateXY':
                    case 'XY':
                        this._css                   = {
                            rangeX                      : 'translateX',
                            rangeY                      : 'translateY'
                        };
                        this.axis                   = ['X', 'Y'];
                        break;
                    case 'translate3D':
                    case '3D':
                        this._css                   = {
                            rangeX                      : 'translateX',
                            rangeY                      : 'translateY',
                            rangeZ                      : 'translateZ',
                        };
                        this.axis                   = ['X', 'Y', 'Z'];
                        break;
                    default:
                        this._css                   = {
                            rangeX                      : 'translateX',
                            rangeY                      : 'translateY'
                        };
                        params.rangeY               = params.rangeX;
                        this.axis                   = ['X', 'Y'];
                        break;
                }
                for (i = 0; i < this.axis.length; i++) {
                    axis                            = this.axis[i];
                    range                           = params['range' + axis] || {
                        from                        : {
                            value                           : 0,
                            type                            : 'px'
                        }
                    };
                    
                    this['toVal' + axis]            = range.from;
                    this['fromVal' + axis]          = typeof(range.to) !== 'undefined' ? range.to : null;
                }
            },
            start                                   : function($el){
                if( !this.duration ){
                    return;
                }
                var css                             = {},
                    transform                       = _getElementTransform($el),
                    cssName, axis, i;
                this.dynamic                        = [];
                for (i = 0; i < this.axis.length; i++) {
                    axis                            = this.axis[i];
                    if(this['fromVal' + axis] === null){
                        cssName                     = this._css['range' + this.axis[i]];
                        this['fromVal' + axis]      = transform[cssName] || transform[cssName] === 0 ? aRD.types.size.parse(transform[cssName]) : this['toVal' + axis];
                    }
                    if( this['toVal' + axis].value === 0 ){
                        this['toVal' + axis].type   = this['fromVal' + axis].type;
                    }
                    if( this._css['range' + axis] === 'translateY' ){
                        aRD.parentHeightToType($el, this['fromVal' + axis], this['toVal' + axis].type);
                    }else if( this._css['range' + axis] === 'translateX' ){
                        aRD.parentWidthToType($el, this['fromVal' + axis], this['toVal' + axis].type);
                    }else{
                        this['fromVal' + axis].type = 'px';
                        this['toVal' + axis].type   = 'px';
                    }
                    this['perc' + axis]             = this['toVal' + axis].value - this['fromVal' + axis].value;
                    if( this['perc' + axis] ){
                        this.dynamic.push(axis);
                        css['range' + axis]         = this['fromVal' + axis].value + this['fromVal' + axis].type;
                    }else{
                        css['range' + axis]         = this['toVal' + axis].value + this['fromVal' + axis].type;
                    }
                }
                if( !this.dynamic.length ){
                    this.duration                   = 0;
                    return;
                }
                return aRD.createByObject(css, this._css );
            },
            step                                    : function(){
                var css                             = {},
                    i;
                for (i = 0; i < this.dynamic.length; i++) {
                    css['range' + this.dynamic[i]]  = (this['fromVal' + this.dynamic[i]].value + (this['perc' + this.dynamic[i]] * this.delta)) + this['fromVal' + this.dynamic[i]].type;
                }
                return aRD.createByObject(css, this._css );
            },
            finish                                  : function(){
                var css                             = {},
                    i;
                for (i = 0; i < this.axis.length; i++) {
                    css['range' + this.axis[i]]     = this['toVal' + this.axis[i]].value + this['toVal' + this.axis[i]].type;
                }
                return aRD.createByObject(css, this._css );
            }
        }, {
            list                                    : [
                { byCheck                               : {
                    name                                    : 'type',
                    allowed                                 : ['translateX', 'translateY', 'translateZ', 'translateXY', 'translate3D', 'X', 'Y', 'Z', 'XY', '3D']
                } },
                { byCheck                               : aRD.createTypeCheck('rangeX', 'sizeRange') },
                { byCheck                               : aRD.createTypeCheck('rangeY', 'sizeRange') },
                { byCheck                               : aRD.createTypeCheck('rangeZ', 'sizeRange') }
            ]
        });
    aRD.aniAdd('skew', {
            axis                                    : ['X', 'Y'],
            init                                    : function($el, params){
                var transform                       = _getElementTransform($el),
                    from, i , axis;
                for (i = 0; i < this.axis.length; i++) {
                    axis                            = this.axis[i];
                    if( params['range' + axis] ){
                        from                        = transform['skew' + axis] || transform['skew' + axis] === 0 ? transform['skew' + axis] : 10;
                        this['has' + axis]          = true;
                        this['toDegree' + axis]     = aRD.toNumber(params['range' + axis].from, 0);
                        this['fromDegree' + axis]   = aRD.toNumber(params['range' + axis].to, from);
                    }
                }
            },
            start                                   : function(){
                var css                             = {},
                    axis, i;
                this.skews                          = [];
                for (i = 0; i < this.axis.length; i++) {
                    axis                            = this.axis[i];
                    if( this['has' + axis] ){
                        this['perc' + axis]         = this['toDegree' + axis] - this['fromDegree' + axis];
                        if( this['perc' + axis] ){
                            this.skews.push(axis);
                            css['skew' + axis]      = this['fromDegree' + axis];
                        }
                    }
                }
                if( !this.skews.length ){
                    this.duration                   = 0;
                    return;
                }
                return css;
            },
            step                                    : function(){
                var css                             = {},
                    i;
                for (i = 0; i < this.skews.length; i++) {
                    css['skew' + this.skews[i]]     = this['fromDegree' + this.skews[i]] + (this['perc' + this.skews[i]] * this.delta);
                }
                return css;
            },
            finish                                  : function(){
                var css                             = {},
                    i;
                for (i = 0; i < this.axis.length; i++) {
                    if( this['has' + this.axis[i]] ){
                        css['skew' + this.axis[i]]      = this['toDegree' + this.axis[i]];
                    }
                }
                return css;
            }
        }, {
            list                                    : [
                { byCheck                               : aRD.createTypeCheck('rangeX', 'degreeRange') },
                { byCheck                               : aRD.createTypeCheck('rangeY', 'degreeRange') }
            ]
        });
    aRD.aniAdd('fitscale', {
            init                                    : function($el, params){
                if( params.height || params.width ){
                   if( params.height ){
                        if( params.height.from ){
                            this.fromHeight             = params.height.from;
                        }
                        if( params.height.to ){
                            this.toHeight               = params.height.to;
                        }
                    }
                    if( params.width ){
                        if( params.width.from ){
                            this.fromWidth             = params.width.from;
                        }
                        if( params.width.to ){
                            this.toWidth                = params.width.to;
                        }
                    }
                }
            },
            start                                   : function($el){
                var
                    size                            = aRD.getWindowSize(),
                    scales                          = [],
                    tmp
                ;
                if( !(this.fromHeight || this.fromWidth) ){
                    tmp                             = $el.outerHeight();
                    this.fromHeight                 = tmp + aRD.inRange( Math.floor(tmp * 0.1), 50, 100 );
                    tmp                             = $el.outerWidth();
                    this.fromWidth                  = tmp + aRD.inRange( Math.floor(tmp * 0.1), 50, 100 );
                }
                if( this.fromHeight && size.height < this.fromHeight ){
                    scales.push( size.height / this.fromHeight );
                }
                if( this.fromWidth && size.width < this.fromWidth ){
                    scales.push( size.width / this.fromWidth );
                }

                if( !scales.length ){
                    if( this.toHeight && size.height > this.toHeight ){
                        scales.push( size.height / this.toHeight );
                    }
                    if( this.toWidth && size.width > this.toWidth ){
                        scales.push( size.width / this.toWidth );
                    }
                }

                return {
                    sizeScale                       : scales.length ? Math.min.apply(Math, scales) : 1
                };
            }
        }, {
            list                                    : [
                { byCheck                               : aRD.createTypeCheck('width', 'range') },
                { byCheck                               : aRD.createTypeCheck('height', 'range') }
            ]
        }, true, true, true);
    aRD.aniAdd('transformOrigin', {
            check                                   : function($el, params){
                return !!(params.height || params.width);
            },
            init                                    : function($el, params){
                this._css                           = {};
                if( params.height ){
                    if( params.height.from ){
                        this.toHeight               = params.height.from;
                    }
                    if( params.height.to ){
                        this.fromHeight             = params.height.to;
                    }
                    this._css.height                = 'transformOriginY';
                }
                if( params.width ){
                    if( params.width.from ){
                        this.toWidth                = params.width.from;
                    }
                    if( params.width.to ){
                        this.fromWidth              = params.width.to;
                    }
                    this._css.width                 = 'transformOriginX';
                }
                if( params.distance ){
                    if( params.distance.from ){
                        this.toDistance             = params.distance.from;
                    }
                    if( params.distance.to ){
                        this.fromDistance           = params.distance.to;
                    }
                    this._css.distance              = 'transformOriginZ';
                }
            },
            start                                   : function($el){
                if( !this.duration ){
                    return;
                }
                var obj                             = _getElementTransformOrigin($el);
                this._parts                         = [];
                this._uparts                        = [];
                this._current                       = {};
                if( this.toHeight ){
                    if( !this.fromHeight ){
                        this.fromHeight             = obj.transformOriginY || {
                            value                   : 50,
                            type                    : '%'
                        };
                    }
                    aRD.parentHeightToType($el, this.fromHeight, this.toHeight.type);
                    this._current.height            = jQuery.extend({}, this.fromHeight);
                    if( this.fromHeight.value !== this.toHeight.value ){
                        this._parts.push('height');
                        this._uparts.push('Height');
                    }
                }
                if( this.toWidth ){
                    if( !this.fromWidth ){
                        this.fromWidth              = obj.transformOriginX || {
                            value                   : 50,
                            type                    : '%'
                        };
                    }
                    aRD.parentWidthToType($el, this.fromWidth, this.toWidth.type);
                    this._current.width             = jQuery.extend({}, this.fromWidth);
                    if( this.fromWidth.value !== this.toWidth.value ){
                        this._parts.push('width');
                        this._uparts.push('Width');
                    }
                }
                if( this.toDistance ){
                    if( !this.fromDistance ){
                        this.fromDistance              = obj.transformOriginX || {
                            value                   : 0,
                            type                    : 'px'
                        };
                    }
                    this._current.distance             = jQuery.extend({}, this.fromDistance);
                    if( this.fromDistance.value !== this.toDistance.value ){
                        this._parts.push('distance');
                        this._uparts.push('Distance');
                    }
                }
                if( !this._parts.length ){
                    this.duration                   = 0;
                }
                return aRD.createByObject(this._current, this._css);
            },
            step                                    : function(){
                var tmp;
                for (var i = 0; i < this._parts.length; i++) {
                    tmp                             = aRD.ucfirst(this._parts[i]);
                    this._current[this._parts[i]].value = aRD.getValuesDelta(
                        this['from' + this._uparts[i]].value,
                        this['to' + this._uparts[i]].value,
                        this.delta
                    );
                }
                return aRD.createByObject(this._current, this._css);
            },
            finish                                  : function(){
                return aRD.createByObject({
                    'height'                        : this.toHeight,
                    'width'                         : this.toWidth,
                    'distance'                      : this.toDistance
                }, this._css );
            }
        }, {
            list                                    : [
                { byCheck : aRD.createTypeCheck('width', 'sizeRange')},
                { byCheck : aRD.createTypeCheck('height', 'sizeRange')},
                { byCheck : aRD.createTypeCheck('distance', 'sizeRange')}
            ]
        }, false, false, false, 'transitionOrigin'
    );
    aRD.addStyling(_transformCSS, function($el, css, styles){
        var obj                                     = _getElementTransform($el),
            i
        ;
        for (i = 0; i < _transformCSS.length; i++) {
            if( typeof( styles[ _transformCSS[i] ] ) !== 'undefined' ){
                obj[ _transformCSS[i] ]             = styles[ _transformCSS[i] ];
                delete styles[ _transformCSS[i] ];
            }
        }

        if( obj.transform ){
            css.transform                           = css.transform;
            $el.data('aocss__transform', {});
        }else{
            var cssObj                              = [],
                has                                 = {},
                valObj                              = jQuery.extend({}, obj)
            ;
            for(i in obj){
                if( obj.hasOwnProperty(i) && typeof(obj[i]) !== 'undefined' ){
                    has[i]                          = true;
                }
            }
            if( has.rotate && (has.rotateX || has.rotateY || has.rotateZ) ){
                has.rotateZ                         = has.rotate;
                valObj.rotateZ                      = obj.rotate;
            }
            if( has.scale ){
                if( !has.scaleX ){
                    has.scaleX                      = true;
                    valObj.scaleX                   = obj.scale;
                }
                if( !has.scaleY ){
                    has.scaleY                      = true;
                    valObj.scaleY                   = obj.scale;
                }
                delete has.scale;
            }
            if( has.sizeScale ){
                valObj.scaleX                       = (has.scaleX ? obj.scaleX : 1) * (obj.sizeScale || 1);
                valObj.scaleY                       = (has.scaleY ? obj.scaleY : 1) * (obj.sizeScale || 1);
                has.scaleX = has.scaleY             = true;
                delete has.sizeScale;
            }
            jQuery.each(has, function(key){
                cssObj.push(key + '(' + valObj[key] + _transformExt[key] + ')');
            });
            css.transform                           = cssObj.join(' ');
        }
    });
    
    aRD.addStyling(_transformOriginCSS, function($el, css, styles){
        var obj                                     = _getElementTransformOrigin($el),
            i
        ;
        for (i = 0; i < _transformOriginCSS.length; i++) {
            if( typeof( styles[ _transformOriginCSS[i] ] ) !== 'undefined' ){
                obj[ _transformOriginCSS[i] ]             = styles[ _transformOriginCSS[i] ];
                delete styles[ _transformOriginCSS[i] ];
            }
        }

        if( obj.transformOrigin ){
            css.transformOrigin                     = css.transformOrigin;
            $el.data('aocss___transformOrigin', {});
        }else{
            css.transformOrigin                     = (obj.transformOriginX ? obj.transformOriginX.value + obj.transformOriginX.type : '50%') + ' ' +
                (obj.transformOriginY ? obj.transformOriginY.value + obj.transformOriginY.type : '50%') + ' ' + (obj.transformOriginZ ? obj.transformOriginZ.value + 'px' : 0)
            ;
        }
    });
})(aRunD);