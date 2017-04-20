/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD A-Z requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD A-Z requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    var splitText                                           = function (val, by){
            if( val instanceof Array ){
                return val;
            }
            if( !(val && typeof(val) === 'string') ){
                return [];
            }
            var
                ret                                         = [],
                reg                                         = new RegExp("(([^" + by + "'\"]*)*('[^']*[']?)*(\"[^\"]*[\"]?)*)*", 'g')
            ;
            val.replace(reg, function (test) {
                if( test ){
                    ret.push(test);
                }
            });
            return ret;
        },
        filterByValue                                       = function (filter, values){
            var isArray                                     = !!(values instanceof Array),
                ret                                         = isArray ? [] : {},
                fn                                          = isArray ? function (val){ ret.push(val); } : function (val, key){ ret[key] = val; }
            ;
            jQuery.each(values, function (key, val){
                if( valueContains(filter, val) ){
                    fn(val, key);
                }
            });
            return ret;
        },
        filterByProperty                                    = function (filter, values, property, strictCheck){
            var isArray                                     = !!(values instanceof Array),
                ret                                         = isArray ? [] : {},
                fn                                          = isArray ? function (val){ ret.push(val); } : function (val, key){ ret[key] = val; },
                checkProps                                  = property instanceof Array ? property : [property]
            ;
            jQuery.each(values, function (key, val){
                if( typeof val === 'object' ){
                    for (var i = 0; i < checkProps.length; i++) {
                        if( valueContains(filter, val[checkProps[i]]) ){
                            fn(val, key);
                            break;
                        }
                    }
                }else if( !strictCheck && valueContains(filter, val) ){
                    fn(val, key);
                }
            });
            return ret;
        },
        valueContains                                       = function (search, value){
            if(search === value){
                return true;
            }
            if( typeof(value) === 'undefined' ){
                return false;
            }
            try {
                var _value                                  = "" + value,
                    _search                                 = "" + search
                ;
                return _value.indexOf(_search) !== -1;
            }
            catch(err) {
                return false;
            }
        },
        loopRange                                           = function (value, min, max){
            if(value > max){
                return loopRange(2*max - value, min, max);
            }else if(value < min){
                return loopRange(min - value, min, max);
            }
            return value;
        }
    ;
    aRD.splitText                                           = splitText;
    aRD.loopRange                                           = loopRange;
    aRD.splitWords                                          = function (val){
        return splitText(val, "\\s");
    };
    aRD.delta                                               = function (val1, val2, delta, canFloat){
        var val                                             = val1 + ( val2 - val1 ) * delta;
        return canFloat ? val : Math.ceil(val);
    };
    aRD.getAttrByPref                                       = function ($el, pref, values, newPref){
        var ret                                             = {},
            _newPref                                        = typeof(newPref) === 'string' ? newPref : pref,
            val, i
        ;
        if( values === true ){
            var attrs                                       = $el[0].attributes,
                length                                      = pref.length
            ;
            for (i = 0; i < attrs.length; i++) {
                if( attrs[i].nodeName.slice(0, length) === pref && attrs[i].nodeValue ){
                    ret[_newPref + attrs[i].nodeName.slice(length)] = attrs[i].nodeValue;
                }
            }
        }else{
            for (i = 0; i < values.length; i++) {
                val                                         = $el.attr(pref + values[i]);
                if( val ){
                    ret[_newPref + values[i]]               = val;
                }
            }
        }
        return ret;
    };
    aRD.heightToType                                        = function ($el, size, type){
        if( !type || size.type === type ){
            return size;
        }
        var pSize;
        if( $el === 'page' ){
            pSize                                           = aRD.getContentSize().height;
        }else{
            pSize                                           = $el.is(window) ? aRD.getWindowSize().height : $el.innerHeight();
        }
        size.value                                          = type === '%' ? size.value/pSize * 100 : pSize/100 * size.value;
        size.type                                           = type;
        return size;
    };
    aRD.parentHeightToType                                  = function ($el, size, type){
        if( !type || size.type === type ){
            return size;
        }
        var pSize;
        switch( $el.css('position') ){
            case 'fixed':
                pSize                                       = aRD.getWindowSize().height;
                break;
            case 'absolute':
                var offParent                               = $el[0].offsetParent;
                if( !offParent && $el.is(':hidden') ){
                    $el.css('display', 'block');
                    offParent                               = $el[0].offsetParent;
                    $el.css('display', 'none');
                }
                pSize                                       = jQuery(offParent).innerHeight();
                break;
            default:
                pSize                                       = $el.parent().innerHeight();
                break;
        }
        size.value                                          = type === '%' ? size.value/pSize * 100 : pSize/100 * size.value;
        size.type                                           = type;
        return size;
    };
    aRD.widthToType                                         = function ($el, size, type){
        if( !type || size.type === type ){
            return size;
        }
        var pSize;
        if( $el === 'page' ){
            pSize                                           = aRD.getContentSize().width;
        }else{
            pSize                                           = $el.is(window) ? aRD.getWindowSize().width : $el.innerWidth();
        }
        size.value                                          = type === '%' ? size.value/pSize * 100 : pSize/100 * size.value;
        size.type                                           = type;
        return size;
    };
    aRD.parentWidthToType                                   = function ($el, size, type){
        if( !type || size.type === type ){
            return size;
        }
        var pSize;
        switch( $el.css('position') ){
            case 'fixed':
                pSize                                       = aRD.getWindowSize().width;
                break;
            case 'absolute':
                var offParent                               = $el[0].offsetParent;
                if( !offParent && $el.is(':hidden') ){
                    $el.css('display', 'block');
                    offParent                               = $el[0].offsetParent;
                    $el.css('display', 'none');
                }
                pSize                                       = jQuery(offParent).innerWidth();
                break;
            default:
                pSize                                       = $el.parent().innerWidth();
                break;
        }
        size.value                                          = type === '%' ? size.value/pSize * 100 : pSize/100 * size.value;
        size.type                                           = type;
        return size;
    };
    aRD.fixSizeValue                                        = function (obj, size){
        return obj.type === '%' ? size * obj.value / 100 : obj.value;
    };
    aRD.filter                                              = function (filter, values, options, strictCheck){
        var tmp                                             = typeof options,
            fn                                              = null
        ;
        switch(tmp){
            case 'undefined':
                fn                                          = filterByValue;
                break;
            default:
                fn                                          = filterByProperty;
                break;
        }
        return fn ? fn(filter, values, options, strictCheck) : null;
    };
    aRD.getData                                             = function ($el, name, preset){
        var data                                            = $el.data(name);
        if( !data && preset ){
            data                                            = preset;
            $el.data(name, data);
        }
        return data;
    };
    aRD.getRangeRandom                                      = function (from, to){
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
    aRD.preventClickable                                    = function(event, $el){
        if($el.is('a, button[type="submit"], input[type="submit"]')){
            event.preventDefault();
        }
    };

    jQuery.fn.aoFindVertical                                = function (selector){
        var $this                                           = jQuery(this),
            ret                                             = jQuery()
        ;
        if( typeof(selector) === 'string' && selector ){
            ret                                             = ret
                .add($this.filter(selector))
                .add($this.parents(selector))
                .add($this.find(selector))
            ;
        }else{
            ret                                             = ret
                .add($this)
                .add($this.parents())
                .add($this.find('*'))
            ;
        }
        return ret;
    };
}));