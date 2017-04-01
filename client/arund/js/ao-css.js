/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD */

(function(aRD){
    var
        __styling                                   = {},
        _css                                        = function($el, styles){
            if( typeof(styles) !== 'object' ){
                return $el;
            }
            var css                                 = {},
                _styles                             = jQuery.extend({}, styles)
            ;
            if( !_styles.onComplete ){
                _styles.onComplete                  = [];
            }
            for(var style in _styles){
                if( _styles.hasOwnProperty(style) || style !== 'onComplete' ){
                    if( !__styling[style] || __styling[style]($el, css, _styles, style) ){
                        css[style]                  = _styles[style];
                    }
                }
            }
            $el.css(css);
            if( _styles.onComplete ){
                aRunD.run(_styles.onComplete, $el);
            }
            if( aRD.setContentSize ){ aRD.setContentSize(); }
            return $el;
        },
        _getStyle                                   = function($el, name, dataName){
            var value, data;
            data                                    = $el.data('aocss__' + (dataName || 'base'));
            if( data && data[name] ){
                value                               = data[name];
            }
            if( typeof(value) === 'undefined' ){
                value                               = $el.css(name);
            }
            return value;
        },
        _storeStyle                                 = function($el, name, value, dataName){
            var data                                = aRD.getData($el, 'aocss__' + (dataName || 'base'), {});
            if( value === 'ao__current' ){
                value                               = $el.css(name);
            }
            data[name]                              = value;
            return value;
        },
        _addStyling                                 = function(keys, func){
            var _keys                               = typeof(keys) === 'string' ? [keys] : keys;
            for (var i = 0; i < _keys.length; i++) {
                __styling[ _keys[i] ]               = func;
            }
        },
        __indexList                                 = [],
        _getMaxIndex                                = function(){
            return __indexList.length ? __indexList[0] : 1000;
        },
        _provideMaxIndex                            = function(noTrack){
            var val                                 = _getMaxIndex() + 3;
            if( !noTrack ){
                __indexList.unshift(val);
            }
            return val;
        },
        _removeMaxIndex                             = function(index){
            for (var i = __indexList.length - 1; i >= 0; i--) {
                if( __indexList[i] === index ){
                    __indexList.splice(i, 1);
                    break;
                }
            }
            return;
        },
        _getOriginalCss                             = function($el, name){
            var ret                                 = false;
            switch(name){
                case 'display':
                    ret                             = $el.css(name);
                    if( ret === 'none' ){
                        ret                         = $el.data('ao__display') || 'block';
                    }
                    break;
                default :
                    ret                             = $el.css(name);
            }
            return ret;
        },
        _getClasses                                 = function(val){
            var list                                = [],
                tmp                                 = '',
                type                                = typeof(val)
            ;
            if( val instanceof Array ){
                for (var i = 0; i < val.length; i++) {
                    tmp                             = _getClasses(val[i]);
                    if( tmp ){
                        list.push(tmp);
                    }
                }
            }else{
                switch(type){
                    case 'string':
                        if( val = jQuery.trim(val) ){
                            list.push(val);
                        }
                        break;
                    case 'function':
                        if( val = _getClasses( val() ) ){
                            list.push(val);
                        }
                        break;
                    case 'object':
                        for (var name in val) {
                            tmp                     = _getClasses(val[name]);
                            if( tmp ){
                                list.push(tmp);
                            }
                        }
                        break;
                }
            }
            return list ? list.join(' ') : '';
        },
        _setClasses                                 = function($el, val){
            $el.attr('class', _getClasses(val));
        }
    ;

    _addStyling('zIndex', function($el, css, styles){
        var ret                                     = false;
        var i                                       = $el.data('ao__maxIndex');
        if( i ){
            $el.data('ao__maxIndex', null);
            _removeMaxIndex( i );
        }
        switch(styles.zIndex){
            case 'max':
                css.zIndex                          = _provideMaxIndex();
                $el.data('ao__maxIndex', css.zIndex);
                break;
            case 'postMax':
                css.zIndex                          = _getMaxIndex() + 1;
                break;
            case 'preMax':
                css.zIndex                          = _getMaxIndex() - 1;
                break;
            default:
                ret                                 = true;
                break;
        }
        return ret;
    });
    _addStyling(['width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight'], function($el, css, styles, name){
        if( typeof(styles[name]) !== 'object'){
            styles[name]                            = aRD.types.size.parse(styles[name]);
        }
        if( styles[name] !== null ){
            css[name]                               = styles[name].value + styles[name].type;
        }
        return false;
    });
    _addStyling(['heightRange', 'widthRange'], function($el, css, styles){
        var from                                    = {},
            to                                      = {},
            has                                     = {},
            toRelative                              = {},
            fromRelative                            = {},
            fit                                     = {},
            isRelative,
            _isRelative                             = function(obj, name){
                return obj[name] && obj[name].type === '%';
            },
            _set                                    = function(range, name){
                if( range ){
                    has[name]                       = true;
                    if( range === 'fit' ){
                        fit[name]                   = true;
                        return;
                    }
                    to[name]                        = range.to;
                    from[name]                      = range.from;
                    toRelative[name]                = _isRelative(to, name);
                    fromRelative[name]              = _isRelative(from, name);
                    isRelative                      = isRelative || toRelative[name] || fromRelative[name];
                }
            }
        ;
        if( styles.heightRange ){
            _set(styles.heightRange, 'height');
            delete styles.heightRange;
        }
        if( styles.widthRange ){
            _set(styles.widthRange, 'width');
            delete styles.widthRange;
        }
        styles.onComplete.unshift(function(){
            var size                                = {},
                max                                 = 10,
                cur                                 = 0,
                minSize                             = {},
                _check                              = function(name, revname, css, needCheck){
                    if( has[name] ){
                        if( fit[name] ){
                            if( css[name] < minSize[name] ){
                                css[name]           = minSize[name];
                                needCheck           = true;
                            }
                        }else{
                            if( to[name] ){
                                value               = toRelative[name] ? css[revname] * to[name].value/100 : to[name].value;
                                if( css[name] > value ){
                                    css[name]       = value;
                                    needCheck       = true;
                                }
                            }
                            if( from[name] ){
                                value               = fromRelative[name] ? css[revname] * from[name].value/100 : from[name].value;
                                if( css[name] < value ){
                                    css[name]       = value;
                                    needCheck       = true;
                                }
                            }
                        }
                    }
                    if( needCheck && cur < max){
                        ++cur;
                        _check(revname, name, css);
                    }
                    return css;
                },
                value
            ;
            if( isRelative || has.width ){
                size.width                          = parseInt($el.css('width'));
            }
            if( isRelative || has.height ){
                size.height                         = parseInt($el.css('height'));
            }
            if( fit.width || fit.height ){
                var el                              = $el[0];
                if( fit.width ){
                    minSize.width                   = el.scrollWidth;
                }
                if( fit.height ){
                    minSize.height                  = el.scrollHeight;
                }
            }
            var vals                                = _check('width', 'height', jQuery.extend({}, size), true);
            if( (isRelative || has.width) && (vals.width === size.width) ){
                delete vals.width;
            }
            if( (isRelative || has.height) && (vals.height === size.height) ){
                delete vals.height;
            }
            $el.css(vals);
        });
        return false;
    });
    _addStyling('display', function($el, css, styles){
        if( styles.display === 'none'){
            var display                             = $el.css('display');
            if( display !== 'none' ){
                $el.data('ao__display', display);
            }
        }
        return true;
    });

    jQuery.extend(aRD.checks, {
        fitWidth                                    : {
            name                                        : 'widthRange',
            allowed                                     : ['fit']
        },
        fitHeight                                   : {
            name                                        : 'heightRange',
            allowed                                     : ['fit']
        }
    });

    aRD.setCss                                      = _css;
    aRD.getOriginalCss                              = _getOriginalCss;
    aRD.addStyling                                  = _addStyling;
    aRD.provideMaxIndex                             = _provideMaxIndex;
    aRD.removeMaxIndex                              = _removeMaxIndex;
    aRD.getStyle                                    = _getStyle;
    aRD.storeStyle                                  = _storeStyle;
    jQuery.fn.aoSetClass                            = function(name, val){
        jQuery(this).each(function(i, el){
            var $el                                 = jQuery(el),
                classes
            ;
            if( !(classes = $el.data('ao__class')) ){
                classes                             = {
                    base                            : $el.data('aoBaseClass') || $el.attr('class')
                };
                $el.data('ao__class', classes);
            }
            if( typeof(val) === 'string' ){
                classes[name]                       = val;
                _setClasses($el, classes);
            }else if( classes.val ){
                delete classes.val;
                _setClasses($el, classes);
            }
        });
        return this;
    };
    jQuery.fn.aoCss                                 = function(css){
        jQuery(this).each(function(i, el){
            _css(jQuery(el), css);
        });
        return this;
    };
})(aRunD);