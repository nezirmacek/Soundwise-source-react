/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD */

(function(aRD){
    var _fromDataString                             = function($el, dataName, settings){
            if( !aRD.hasDataString($el, dataName) ){
                return null;
            }
            return _getDataFromString($el.data(dataName), settings);
        },
        _splitText                                  = function(str, by){
            var
                ret                                 = [],
                reg                                 = new RegExp("(([^" + by + "'\"]*)*('[^']*[']?)*(\"[^\"]*[\"]?)*)*", 'g')
            ;
            str.replace(reg, function(test) {
                if( test ){
                    ret.push(test);
                }
            });
            return ret;
        },
        _fromSpaceString                            = function(value){
            if( !value ){
                return [];
            }
            if( typeof(value) !== 'string' ){
                return value;
            }
            var ret                                 = _splitText(value, "\\s");
            return ret;
        },
        _fromArray                                  = function(arr, params, key){
            if( !( params && params.list.length && jQuery.isArray(arr) && arr.length ) ){
                return {};
            }
            var
                ret                                 = {},
                length                              = typeof(params.maxLength) === 'number' && arr.length > params.maxLength ? params.maxLength : arr.length,
                i                                   = 0,
                k                                   = 0,
                checks, value, name, check, j
            ;
            if( key && params.keyCheck ){
                check                               = params.keyCheck;
                if( _doCheck( key, check ) ){
                    value                           = key;
                }else if( arr.length && _doCheck( arr[0], check ) ){
                    value                           = arr[0];
                    arr.splice(0, 1);
                    if( !(typeof(params.maxLength) === 'number' && arr.length > params.maxLength) ){
                        length                      = arr.length;
                    }
                }else{
                    value                           = key;
                }
                ret[aRD.getObjProp(check.name, true, 'l' + length + ',name')] = check.parse ? check.parse(value) : value;
            }
            while( i < params.list.length && k < arr.length ){
                if( !params.list[i] ){
                    break;
                }
                if(arr[k] === '-'){
                    ++i;
                    ++k;
                    continue;
                }
                value                               = aRD.toJsValue(arr[k]);
                name                                = aRD.getObjProp(params.list[i], true, 'name');
                checks                              = aRD.getObjProp(params.list[i], false, 'byCheck');
                if( checks ){
                    check                           = _getPassedCheck(value, checks);
                    if( check ){
                        name                        = aRD.getObjProp(check.name, true, 'l' + length + ',name');
                        if( check.parse ){
                            value                   = check.parse(value);
                        }
                    }
                }
                if( jQuery.isArray(name) ){
                    for (j = 0; j < name.length; j++) {
                        if( !ret[name[j]] ){
                            name                    = name[j];
                        }
                    }
                    //if not found set to last possible
                    if( jQuery.isArray(name) ){
                        name                        = name[j];
                    }
                }
                ++i;
                if( typeof(name) === 'string' ){
                    ret[name]                       = value;
                    ++k;
                }else if( aRD.getObjProp(params.list[i], false, 'required') ){
                    ++k;
                }
            }

            return ret;
        },
        _getValueFromSettings                       = function(value, settings, name){
            var type                                = typeof(settings) === 'object' ? settings.type : settings;
            switch( type ){
                case 'bool'                         :
                    value                           = !!(!value || value === '0' || value === 'false');
                    break;
                case 'process'                      :
                    value                           = settings.func ? settings.func(value, settings) : null;
                    break;
                case 'datastring'                   :
                    value                           = _fromSpaceString(value);
                    if( settings.params ){
                        if( jQuery.isArray(value) || typeof(value) !== 'object' ){
                            value                   = _fromArray(jQuery.isArray(value) ? value : [value], settings.params, name);
                        }
                    }
                    break;
                default                             :
                    if( type && typeof(type) === 'string' && aRD.types[type] ){
                        var pass                    = _doCheck(value, aRD.types[type]);
                        if( pass ){
                            value                   = aRD.types[type].parse ? aRD.types[type].parse(value) : value;
                        }else{
                            value                   = null;
                        }
                    }else{
                        value                       = aRD.toJsValue(value);
                    }
                    break;
            }
            return value;
        },
        _fillFromSettings                           = function(obj, settings){
            jQuery.each(settings, function(name, params){
                obj[name]                           = _getValueFromSettings(obj[name], params, name);
            });
            return obj;
        },
        _getDataFromString                           = function(str, settings, asArray){
            if( typeof(str) !== 'string' ){
                return {};
            }
            var
                raw                                 = _splitText(str, ';'),
                tmp                                 = null,
                name                                = null,
                value                               = null,
                ret                                 = asArray ? [] : {},
                setName, setKey, check
            ;

            for (var i = 0; i < raw.length; i++) {
                tmp                                 = raw[i].split(':');
                if( tmp.length > 0 ){
                    name                            = jQuery.trim(tmp[0]);
                    if( name ){
                        value                       = tmp.length > 1 ? jQuery.trim( tmp.slice(1).join(':') ) : true;
                        if( value === '' ){
                            value                   = true;
                        }else{
                            setName                 = false;
                            if( settings && typeof(value) === 'string' ){
                                tmp                 = _fromSpaceString(value);
                                if( name && settings.keyCheck ){
                                    check           = settings.keyCheck;
                                    setKey          = check.name;
                                    setName         = name;
                                    if( !_doCheck( name, check ) && tmp.length && _doCheck( tmp[0], check ) ){
                                        setName     = tmp[0];
                                        value       = tmp.slice(1).join(' ');
                                    }
                                }
                            }
                            if( settings && (settings[setName || name] || settings['_default']) ){
                                value               = _getValueFromSettings(value, settings[setName || name] || settings['_default'], name);
                                if( setName ){
                                    if( settings[setName].type === 'datastring' ){
                                        value[setKey] = setName;
                                        setName     = null;
                                    }
                                }
                            }else{
                                value               = aRD.toJsValue(value);
                            }
                        }
                        if( asArray ){
                            ret.push({
                                name                : name,
                                value               : value
                            });
                        }else{
                            ret[name]               = value;
                        }
                    }
                }
            }

            return ret;
        },
        _getPassedCheck                             = function(value, checks){
            if( !jQuery.isArray(checks) ){
                checks                              = [checks];
            }
            for (var i = 0; i < checks.length; i++) {
                if( _doCheck( value, checks[i] ) ){
                    return checks[i];
                }
            }

            return null;
        },
        _doCheck                                    = function(value, check){
            var _type                               = typeof(value);
            return check && (
                typeof(check) !== 'object' || (
                    (!check.type || ( aRD.types[check.type] && aRD.types[check.type] !== check ? _doCheck(value, aRD.types[check.type]) : check.type === _type )) &&
                    (!check.reg || check.reg.test(value)) &&
                    (!check.allowed || jQuery.inArray(value, check.allowed) !== -1) &&
                    (!check.keyObj || check.keyObj[value]) &&
                    (!check.check || (typeof( check.check ) === 'function' ? check.check(value) : _doCheck(value, check.check)))
                )
            );
        },
        _getHexColorPart                            = function(val){
            if( val > 255 ){
                return 'FF';
            }else if( val < 0 ){
                return '00';
            }
            var hex                                 = val.toString(16);
            return (hex.length === 1) ? '0' + hex : hex;
        },
        _colorToString                              = function(color){
            if( typeof(color) === 'string' ){
                return color.charAt(0) === '#' ? color : '#' + color;
            }else if( typeof(color) === 'object' ){
                if( color.a === 1 ){
                    return '#' + _getHexColorPart(color.r) + _getHexColorPart(color.g) + _getHexColorPart(color.b);
                }else{
                    return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')';
                }
            }
        },
        _getValuesDelta                             = function(val1, val2, delta, canFloat){
            var val                                 = val1 + ( val2 - val1 ) * delta;
            return canFloat ? val : Math.ceil(val);
        },
        _getDeltaColor                              = function(color1, color2, delta, toString){
            var _delta                              = typeof(delta) === 'number' ? delta : 0.5,
                _color1                             = typeof(color1) === 'object' ? color1 : _hexToRGBA(color1, null, color2),
                _color2                             = typeof(color2) === 'object' ? color2 : _hexToRGBA(color2, null, color1),
                ret                                 = {
                    r                               : _getValuesDelta(_color1.r, _color2.r, _delta),
                    g                               : _getValuesDelta(_color1.g, _color2.g, _delta),
                    b                               : _getValuesDelta(_color1.b, _color2.b, _delta),
                    a                               : _getValuesDelta(_color1.a, _color2.a, _delta),
                }
            ;
            return toString ? _colorToString(ret) : ret;
        },
        _hexToRGBA                                  = function(hex, alpha, subColor, required){
            if( hex === 'transparent' || (required && !hex) ){
                if( subColor && subColor !== 'transparent' ){
                    return jQuery.extend(
                        {},
                        typeof(subColor) === 'object' ? subColor : _hexToRGBA(subColor),
                        {a: 0}
                    );
                }else{
                    return {r:0, g:0, b:0, a:0};
                }
            }else if( typeof(hex) === 'object' ){
                return hex;
            }
            var _hex                                = hex.charAt(0) === '#' ? hex.slice(1) : hex,
                partLength                          = _hex.length/3,
                ret                                 = {},
                parts                               = ['r', 'g', 'b'],
                tmp
            ;
            for (var i = 0; i < parts.length; i++) {
                tmp                                 = _hex.substring(i * partLength, (i + 1) * partLength);
                ret[parts[i]]                       = parseInt(tmp.length === 1 ? tmp + tmp : tmp, 16);
            }
            ret.a                                   = typeof(alpha) === 'number' ? alpha : 1;
            return ret;
        },
        _getRGBAdiffParts                           = function(rgba1, rgba2){
            var ret                                 = [],
                parts                               = ['r', 'g', 'b', 'a']
            ;
            for (var i = 0; i < parts.length; i++) {
                if( rgba1[parts[i]] !== rgba2[parts[i]] ){
                    ret.push(parts[i]);
                }
            }
            return ret;
        },
        _makeRangeRegStr                            = function(regStr){
            return "^((?:" + regStr + ")?)(?:\\:(" + regStr + "))?$";
        },
        _parseRange                                 = function(reg, value, toIndex, fn){
            var type                                = typeof(value),
                ret                                 = {
                    from                            : null,
                    to                              : null
                },
                _fn                                 = typeof(fn) === 'function' ? fn : false,
                _toI                                = toIndex || 2
            ;
            if( type === 'number' ){
                ret.from                            = _fn ? _fn(value) : value;
            }
            if( type === 'string' ){
                var matches                         = reg.exec(value);
                if( matches && matches.length > 1 ){
                    if( matches[1] ){
                        ret.from                    = _fn ? _fn.apply( matches[1], matches.slice(1, _toI) ) : aRD.toNumber(matches[1], null);
                    }
                    if( matches && matches.length > _toI ){
                        ret.to                      = _fn ? _fn.apply( matches[_toI], matches.slice(_toI) ) : aRD.toNumber(matches[_toI], null);
                    }
                }
            }
            return ret;
        },
        _TNumber                                    = {
            regStr                                  : "(?:\\+|\\-)?[0-9]+(\\.[0-9]+)?",
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( type === 'string' && _TNumber._reg.test(value) );
            },
            parse                                   : function(value){
                var type                            = typeof(value),
                    ret                             = 0
                ;
                if( type === 'number' ){
                    return value;
                }
                if( type === 'string' ){
                    var matches                     = _TNumber._reg.exec(value);
                    if( matches && matches.length > 1 ){
                        ret                         = aRD.toNumber(matches[1], ret);
                    }
                }
                return ret;
            }
        },
        _TColor                                     = {
            type                                    : 'string',
            hexStr                                  : "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})",
            rgbStr                                  : "rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)",
            rgbaStr                                 : "rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*(1|0(?:\\.\\d+)?)\\)",
            check                                   : function(value){
                return value === 'transparent' || _TColor._reg.test(value);
            },
            parse                                   : function(value){
                var type                            = typeof(value),
                    ret                             = null
                ;
                if( type === 'string' ){
                    if( value === 'transparent' ){
                        ret                         = value;
                    }else{
                        var matches                 = _TColor._reg.exec(value);
                        if( matches && matches.length > 1 ){
                            if( matches[1] ){
                                ret                 = _hexToRGBA(matches[1]);
                            }else if( matches[2] ){
                                //rgb
                                ret                 = {
                                    r               : parseInt(matches[2]),
                                    g               : parseInt(matches[3]),
                                    b               : parseInt(matches[4]),
                                    a               : 1
                                };
                            }else if( matches[5] ){
                                //rgba
                                ret                 = {
                                    r               : parseInt(matches[5]),
                                    g               : parseInt(matches[6]),
                                    b               : parseInt(matches[7]),
                                    a               : parseInt(matches[8])
                                };
                            }
                            
                        }
                    }
                }
                return ret;
            }
        },
        _TPercent                                   = {
            regStr                                  : "(" + _TNumber.regStr + ")([\%]?)",
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( type === 'string' && _TPercent._reg.test(value) );
            },
            parse                                   : function(value){
                var type                            = typeof(value),
                    ret                             = 1
                ;
                if( type === 'number' ){
                    ret                             = value;
                }else if( type === 'string' ){
                    var matches                     = _TPercent._reg.exec(value);
                    if( matches && matches.length > 1 ){
                        ret                         = aRD.toNumber(matches[1], ret);
                    }
                }
                return ret;
            }
        },
        _TDegree                                    = {
            regStr                                  : "(" + _TNumber.regStr + ")(?:deg)?",
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( type === 'string' && _TDegree._reg.test(value) );
            },
            parse                                   : function(value){
                var type                            = typeof(value),
                    ret                             = 0
                ;
                if( type === 'number' ){
                    ret                             = value;
                }else if( type === 'string' ){
                    var matches                     = _TDegree._reg.exec(value);
                    if( matches && matches.length > 1 ){
                        ret                         = aRD.toNumber(matches[1], ret);
                    }
                }
                return ret;
            }
        },
        _TSize                                      = {
            regStr                                  : "(" + _TNumber.regStr + ")((?:[\\%]?)|(?:px)?)",
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( type === 'string' && _TSize._reg.test(value) );
            },
            parse                                   : function(value){
                var type                            = typeof(value),
                    ret                             = null
                ;
                if( type === 'number' ){
                    return {
                        value                       : value,
                        type                        : 'px'
                    };
                }else if( type === 'string' ){
                    var matches                     = _TSize._reg.exec(value);
                    if( matches && matches.length > 1 ){
                        ret                         = {
                            value                   : aRD.toNumber(matches[1], 0),
                            type                    : 'px'
                        };
                        if(matches.length > 3){
                            ret.type                = matches[3];
                        }
                    }
                }
                return ret;
            }
        },
        _TRange                                     = {
            _reg                                    : new RegExp( _makeRangeRegStr(_TNumber.regStr) ),
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( value && type === 'string' && _TRange._reg.test(value) );
            },
            parse                                   : function(value){
                return _parseRange(_TRange._reg, value, 3);
            }
        },
        _TPercentRange                          = {
            _reg                                    : new RegExp( _makeRangeRegStr(_TPercent.regStr) ),
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( value && type === 'string' && _TPercentRange._reg.test(value) );
            },
            parse                                   : function(value){
                return _parseRange(_TPercentRange._reg, value, 5, function(all, number){
                    return aRD.toNumber(arguments.length > 1 ? number : all, null);
                });
            }
        },
        _TDegreeRange                           = {
            _reg                                    : new RegExp( _makeRangeRegStr(_TDegree.regStr) ),
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( value && type === 'string' && _TDegreeRange._reg.test(value) );
            },
            parse                                   : function(value){
                return _parseRange(_TDegreeRange._reg, value, 4, function(all, number){
                    return aRD.toNumber(arguments.length > 1 ? number : all, null);
                });
            }
        },
        _TSizeRange                                 = {
            _reg                                    : new RegExp( _makeRangeRegStr(_TSize.regStr) ),
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( value && type === 'string' && _TSizeRange._reg.test(value) );
            },
            parse                                   : function(value){
                return _parseRange(_TSizeRange._reg, value, 5, function(all, number, rest, type){
                    var value                       = aRD.toNumber(arguments.length > 1 ? number : all, null);
                    return value === null ? value : {
                        value                       : value,
                        type                        : type || 'px'
                    };
                });
            }
        },
        _TUrl                                       = {
            type                                    : 'string',
            reg                                     : new RegExp("^url\([^\(\)]+\)$", "i")
        },
        _getAttrByPref                              = function($el, pref, values, newPref){
            var ret                                 = {},
                _newPref                            = typeof(newPref) === 'string' ? newPref : pref,
                val, i
            ;
            if( values === true ){
                var attrs                           = $el[0].attributes,
                    length                          = pref.length
                ;
                for (i = 0; i < attrs.length; i++) {
                    if( attrs[i].nodeName.slice(0, length) === pref && attrs[i].nodeValue ){
                        ret[_newPref + attrs[i].nodeName.slice(length)] = attrs[i].nodeValue;
                    }
                }
            }else{
                for (i = 0; i < values.length; i++) {
                    val                             = $el.attr(pref + values[i]);
                    if( val ){
                        ret[_newPref + values[i]]   = val;
                    }
                }
            }
            
            return ret;
        },
        _inCincleRange                              = function(value, min, max){
            if(value > max){
                return _inCincleRange(2*max - value, min, max);
            }else if(value < min){
                return _inCincleRange(min - value, min, max);
            }
            return value;
        },
        _parentHeightToType                         = function($el, size, type){
            if( !type || size.type === type ){
                return size;
            }
            var pSize;
            switch( $el.css('position') ){
                case 'fixed':
                    pSize                           = aRD.getWindowSize().height;
                    break;
                case 'absolute':
                    var offParent                   = $el[0].offsetParent;
                    if( !offParent && $el.is(':hidden') ){
                        $el.css('display', 'block');
                        offParent                   = $el[0].offsetParent;
                        $el.css('display', 'none');
                    }
                    pSize                           = jQuery(offParent).innerHeight();
                    break;
                default:
                    pSize                           = $el.parent().innerHeight();
                    break;
            }
            size.value                              = type === '%' ? size.value/pSize * 100 : pSize/100 * size.value;
            size.type                               = type;
            return size;
        },
        _heightToType                               = function($el, size, type){
            if( !type || size.type === type ){
                return size;
            }
            var pSize                               = $el.is(window) ? aRD.getWindowSize().height : $el.innerHeight();
            size.value                              = type === '%' ? size.value/pSize * 100 : pSize/100 * size.value;
            size.type                               = type;
            return size;
        },
        _parentWidthToType                          = function($el, size, type){
            if( !type || size.type === type ){
                return size;
            }
            var pSize;
            switch( $el.css('position') ){
                case 'fixed':
                    pSize                           = aRD.getWindowSize().width;
                    break;
                case 'absolute':
                    var offParent                   = $el[0].offsetParent;
                    if( !offParent && $el.is(':hidden') ){
                        $el.css('display', 'block');
                        offParent                   = $el[0].offsetParent;
                        $el.css('display', 'none');
                    }
                    pSize                           = jQuery(offParent).innerWidth();
                    break;
                default:
                    pSize                           = $el.parent().innerWidth();
                    break;
            }
            size.value                              = type === '%' ? size.value/pSize * 100 : pSize/100 * size.value;
            size.type                               = type;
            return size;
        },
        _widthToType                                = function($el, size, type){
            if( !type || size.type === type ){
                return size;
            }
            var pSize                               = $el.is(window) ? aRD.getWindowSize().width : $el.innerWidth();
            size.value                              = type === '%' ? size.value/pSize * 100 : pSize/100 * size.value;
            size.type                               = type;
            return size;
        },
        _fixSizeValue                               = function(obj, size){
            return obj.type === '%' ? size * obj.value / 100 : obj.value;
        },
        _valueContains                              = function(search, value){
            if(search === value){
                return true;
            }
            if( typeof(value) === 'undefined' ){
                return false;
            }
            try {
                var _value                          = "" + value,
                    _search                         = "" + search
                ;
                return _value.indexOf(_search) !== -1;
            }
            catch(err) {
                return false;
            }
        },
        _filterByValue                              = function(filter, values){
            var isArray                             = !!(values instanceof Array),
                ret                                 = isArray ? [] : {},
                fn                                  = isArray ? function(val){ ret.push(val); } : function(val, key){ ret[key] = val; }
            ;
            jQuery.each(values, function(key, val){
                if( _valueContains(filter, val) ){
                    fn(val, key);
                }
            });
            return ret;
        },
        _filterByProperty                           = function(filter, values, property, strictCheck){
            var isArray                             = !!(values instanceof Array),
                ret                                 = isArray ? [] : {},
                fn                                  = isArray ? function(val){ ret.push(val); } : function(val, key){ ret[key] = val; },
                checkProps                          = property instanceof Array ? property : [property]
            ;
            jQuery.each(values, function(key, val){
                if( typeof val === 'object' ){
                    for (var i = 0; i < checkProps.length; i++) {
                        if( _valueContains(filter, val[checkProps[i]]) ){
                            fn(val, key);
                            break;
                        }
                    }
                }else if( !strictCheck && _valueContains(filter, val) ){
                    fn(val, key);
                }
            });
            return ret;
        },
        _filter                                     = function(filter, values, options, strictCheck){
            var tmp                                 = typeof options,
                fn                                  = null
            ;
            switch(tmp){
                case 'undefined':
                    fn                              = _filterByValue;
                    break;
                default:
                    fn                              = _filterByProperty;
                    break;
            }
            return fn ? fn(filter, values, options, strictCheck) : null;
        }
    ;
    _TColor._reg                                    = new RegExp("^(?:(?:" + _TColor.hexStr + ")|(?:" + _TColor.rgbStr + ")|(?:" + _TColor.rgbaStr + "))$");
    _TNumber._reg                                   = new RegExp("^(" + _TNumber.regStr + ")$");
    _TSize._reg                                     = new RegExp("^" + _TSize.regStr + "$");
    _TPercent._reg                                  = new RegExp("^" + _TPercent.regStr + "$");
    _TDegree._reg                                   = new RegExp("^" + _TDegree.regStr + "$");

    //Types checks, parsing
    aRD.types                                       = {
        number                                      : _TNumber,
        color                                       : _TColor,
        url                                         : _TUrl,
        percent                                     : _TPercent,
        degree                                      : _TDegree,
        size                                        : _TSize,
        range                                       : _TRange,
        percentRange                                : _TPercentRange,
        degreeRange                                 : _TDegreeRange,
        sizeRange                                   : _TSizeRange
    };
    aRD.filter                                      = _filter;
    aRD.createTypeCheck                             = function(name, type, obj){
        return jQuery.extend({
            name                                    : name || null,
            type                                    : type,
            parse                                   : aRD.types[type] && aRD.types[type].parse ? aRD.types[type].parse : null
        }, obj || {});
    };
    aRD.checks                                      = {
        display                                     : {
            name                                        : 'display',
            allowed                                     : ['block', 'none', 'inline', 'inline-block', 'table', 'table-cell']
        },
        insert                                      : {
            name                                        : 'insert',
            allowed                                     : ['append', 'prepend', 'before', 'after']
        },
        range                                       : aRD.createTypeCheck('range', 'range'),
        vAction                                     : {
            name                                        : 'vAction',
            check                                       : function(value){
                var type                                = typeof(value);
                return type === 'boolean' || value === 'show' || value === 'hide';
            },
            parse                                       : function(value){
                if(typeof(value) === 'string'){
                    return value === 'show' ? true : false;
                }
                return !!value;
            }
        }
    };
    aRD.getRangeRandom                              = function(from, to){
        if( to === null || aRD.toNumber(to) === null || to === from ){
            return from;
        }
        if( from === null || aRD.toNumber(from) === null ){
            return to;
        }
        return (to < from) ?
            Math.floor(Math.random() * (from - to + 1)) + to :
            Math.floor(Math.random() * (to - from + 1)) + from
        ;
    };
    aRD.getData                                     = function($el, name, preset){
        var data                                    = $el.data(name);
        if( !data && preset ){
            data                                    = preset;
            $el.data(name, data);
        }
        return data;
    };
    aRD.setFieldValue                               = function(valObj, $field){
        var $checks;
        if( valObj.id ){
            $field                                  = $field ? $field.filter( '#' + valObj.id ) : jQuery( '#' + valObj.id );
        }
        if( $field && $field.length ){
            if( valObj.value instanceof Array ){
                return $field.filter('select[multiple]').first().val( valObj.value );
            }
            $checks                                 = typeof(valObj.value) !== 'object' ? $field.filter('[type="radio"], [type="checkbox"]').filter('[value="' + valObj.value + '"]' + ( valObj.value === 'on' ? ', :not([value])' : '' ) ) : jQuery([]);
            if( $checks.length ){
                return $checks.first().prop('checked', true).aoTriggerChange();
            }else{
                var $el                             = $field.not('[type="radio"], [type="checkbox"]').first();
                if( $el.data("DateTimePicker") ){
                    $el.data("DateTimePicker").date( valObj.value );
                }else{
                    $el.val( valObj.value );
                }
                return $el.aoTriggerChange();
            }
        }
        return false;
    };

    jQuery.fn.aoFindVertical                        = function(selector){
        var $this                                   = jQuery(this),
            ret                                     = jQuery()
        ;
        if( typeof(selector) === 'string' && selector ){
            ret                                     = ret
                .add($this.filter(selector))
                .add($this.parents(selector))
                .add($this.find(selector))
            ;
        }else{
            ret                                     = ret
                .add($this)
                .add($this.parents())
                .add($this.find('*'))
            ;
        }
        return ret;
    };

    aRD.makeRangeRegStr                             = _makeRangeRegStr;
    aRD.parseRange                                  = _parseRange;
    aRD.fromDataString                              = _fromDataString;
    aRD.fromSpaceString                             = _fromSpaceString;
    aRD.fromArray                                   = _fromArray;
    aRD.getPassedCheck                              = _getPassedCheck;
    aRD.checkCustomType                             = _doCheck;
    aRD.getValueFromSettings                        = _getValueFromSettings;
    aRD.fillFromSettings                            = _fillFromSettings;
    aRD.getDataFromString                           = _getDataFromString;
    aRD.getAttrByPref                               = _getAttrByPref;
    aRD.getDeltaColor                               = _getDeltaColor;
    aRD.hexToRGBA                                   = _hexToRGBA;
    aRD.colorToString                               = _colorToString;
    aRD.getValuesDelta                              = _getValuesDelta;
    aRD.inCincleRange                               = _inCincleRange;
    aRD.getRGBAdiffParts                            = _getRGBAdiffParts;
    aRD.heightToType                                = _heightToType;
    aRD.parentHeightToType                          = _parentHeightToType;
    aRD.widthToType                                 = _widthToType;
    aRD.parentWidthToType                           = _parentWidthToType;
    aRD.fixSizeValue                                = _fixSizeValue;

})(aRunD);