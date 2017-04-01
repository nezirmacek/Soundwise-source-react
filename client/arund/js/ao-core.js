/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD: true, console */
aRunD                                               = {
    $w                                              : jQuery(window),
    $doc                                            : jQuery(document),
    debug                                           : false,
    loaded                                          : false,
    flist                                           : {}, // list of functions groups
    css                                             : {}, // list of css classes
    dateFormat                                      : 'DD.MM.YYYY hh:mm a', // default date format
    selectors                                       : {}, // list of selectors,
    checkCookie                                     : function(){
        return true;
    },
    pushFlist                                       : function(name){
        if( typeof(name) !== 'string' || !name ){
            return false;
        }
        aRunD.flist[name]                           = aRunD.flist[name] || [];
        var
            from                                    = 1,
            length                                  = arguments.length - from,
            args                                    = new Array(length),
            i
        ;
        if(length){
            for (i = 0; i < length; i++) {
                args[i]                             = arguments[i + from];
            }
            aRunD.flist[name]                       = aRunD.flist[name].concat(args);
        }
        return true;
    },
    returnFirst                                     : function(val){
        return val;
    },
    clearFlist                                      : function(name){
        if( typeof(name) !== 'string' || !name ){
            return false;
        }
        delete aRunD.flist[name];
        return true;
    },
    padLeft                                         : function(val, length, padStr){
        var str                                     = typeof(val) !== 'object' ? val + '' : '';
        return str.length < length ? new Array(length - str.length + 1).join(padStr || '0') + str : str;
    },
    runFlist                                        : function(name){
        if( !aRunD.flist[name] ){
            return false;
        }
        var
            from                                    = 1,
            length                                  = arguments.length - from,
            args                                    = new Array(length),
            i
        ;
        for (i = 0; i < length; i++) {
            args[i]                                 = arguments[i + from];
        }
        for (var j = 0; j < aRunD.flist[name].length; j++) {
            if(aRunD.flist[name][j].apply(aRunD, args) === false){
                return false;
            }
        }
        return true;
    },
    run                                             : function(funcs){
        var
            from                                    = 1,
            length                                  = arguments.length - from,
            args                                    = new Array(length),
            type                                    = typeof(funcs),
            ret                                     = true,
            i
        ;
        for (i = 0; i < length; i++) {
            args[i]                                 = arguments[i + from];
        }
        if( type === 'function' ){
            ret                                     = funcs.apply(aRunD, args) !== false;
        }else if( type === 'object' ){
            jQuery.each(funcs, function(i, fn){
                if( (ret = aRunD.run.apply(aRunD, [fn].concat(args))) === false){
                    return false;
                }
            });
        }
        return ret;
    },
    apply                                           : function(func, _this, _args){
        return typeof(func) === 'function' ? func.apply(_this, _args) : null;
    },
    escapeRegExp                                    : function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },
    log                                             : function(msg){
        if( aRunD.debug && window.console ){
            console.log( msg );
        }
        return aRunD;
    },
    hasElements                                     : function(elements, $err){
        if ( !elements.length ) {
            if ( $err ) {
                aRunD.log( $err );
            }
            return false;
        }
        return true;
    },
    hasDataString                                   : function($el, name){
        return $el.data(name) && typeof($el.data(name)) === 'string';
    },
    unique                                          : function(arr){
        var ret                                     = [];
        for (var i = 0; i < arr.length; i++) {
            if( i === jQuery.inArray(arr[i], arr) ){
                ret.push(arr[i]);
            }
        }
        return ret;
    },
    isInt                                           : function(value){
        return Number(value) === value && value % 1 === 0;
    },
    isFloat                                         : function(value){
        return value === Number(value) && value % 1 !== 0;
    },
    toNumber                                        : function(value, noSet){
        var type                                    = typeof(value);
        if( type !== 'string' && type !== 'number' ){
            return typeof(noSet) !== 'undefined' ? noSet : null;
        }
        value                                       = Number( value );
        return isNaN(value) ? (typeof(noSet) !== 'undefined' ? noSet : null) : value;
    },
    getFloatLength                                  : function(value){
        if( !aRunD.isFloat(value) ){
            return 0;
        }
        value                                       = (value + "").split('.');
        return value.length > 1 ? value[1].length : 0;
    },
    inRange                                         : function(value, min, max){
        if( typeof(min) !== 'number' && typeof(max) !== 'number' ){
            return value;
        }
        value                                       = aRunD.toNumber(value) || 0;
        if( typeof(min) === 'number' && value < min ){
            return min;
        }
        if( typeof(max) === 'number' && value > max ){
            return max;
        }
        return value;
    },
    ucfirst                                         : function(str){
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    getAttribute                                    : function($el, name, pref){
        if( typeof( $el.attr(name) ) !== 'undefined' ){
            return $el.attr(name);
        }
        pref        = pref || '';
        if( typeof( $el.attr('data-js-' + name) ) !== 'undefined' ){
            name    = ('js-' + name).replace(/-[a-z]/g, function (str) {
                return str.charAt(1).toUpperCase();
            });
            return $el.data(name);
        }
        return;
    },
    getRangeObject                                  : function(objs, value){
        var ret                                     = false;
        jQuery.each(objs, function(i, obj){
            if( value >= obj.from && (!ret || ret.from < obj.from) ){
                ret                                 = obj;
            }
        });
        return ret;
    },
    find                                            : function($el, defaultSel, defaultType){
        var
            type                                    = $el.data('jsSelectorType') || defaultType || 'find',
            selector                                = $el.data('jsSelector') || defaultSel
        ;
        if( type === 'root' ){
            return jQuery(selector);
        }
        if( !type || !jQuery()[type] ){
            return jQuery([]);
        }
        return $el[type](selector);
    },
    findByData                                      : function(data, dataNames){
        var selectors                               = [];
        if( !data ){
            return jQuery([]);
        }
        jQuery.each(jQuery.isArray(dataNames) ? dataNames : [dataNames], function(i, dataName){
            if( data && data !== '' ){
                selectors.push('[' + dataName + '="' + data + '"]', '[' + dataName + '^="' + data + '"]');
            }else{
                selectors.push('[' + dataName + ']');
            }
        });
        return jQuery(selectors.join(','));
    },
    toJsValue                                       : function(value){
        var ret                                     = null;
        try{
            ret                                     = jQuery.parseJSON(value);
        }catch(e){
            ret                                     = value;
        }
        return ret;
    },
    getDataOptions                                  : function($el, pref, allowed){
        var
            ret                                     = {},
            data                                    = $el.data()
        ;
        if( !pref && !allowed ){
            return data;
        }
        jQuery.each(data, function(name, value){
            if( pref ){
                if( !name.match("^" + pref) ){
                    return;
                }
                if( allowed ){
                    name                            = name.charAt( pref.length ).toLowerCase() + name.slice( pref.length + 1 );
                }
            }
            if( allowed && jQuery.inArray(name, allowed) === -1){
                return;
            }
            ret[name]                               = value;
        });
        return ret;
    },
    randomId                                        : function(obj) {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1)
            ;
        }
        var ret                                     = s4() + s4();
        return obj && typeof(obj[ret]) !== 'undefined' ? aRunD.randomId(obj) : ret;
    },
    createKeys                                      : function(){
        var keys                                    = [],
            obj                                     = {},
            i, j, list
        ;
        for (i = 0; i < arguments.length; i++) {
            list                                    = arguments[i];
            if( typeof(list) === 'string' ){
                if( obj[list] ){
                    keys.push(list);
                    obj[list]                       = true;
                }
            }else if( list instanceof Array ){
                for (j = 0; j < list.length; j++) {
                    if( !obj[list[j]] ){
                        keys.push(list[j]);
                        obj[list[j]]                = true;
                    }
                }
            }
        }
        list                                        = null;
        return keys;
    },
    createByObject                                  : function(obj, byObj){
        var ret                                     = {};
        for(var i in byObj){
            if(byObj.hasOwnProperty(i) && obj.hasOwnProperty(i)){
                if( typeof(byObj[i]) === 'object' ){
                    ret[byObj[i].to || i] = obj[byObj[i].from || i];
                }else{
                    ret[byObj[i]]                   = obj[i];
                }
            }
        }
        return ret;
    },
    /*
        @arguments obj, returnObj, properties...
            obj                                     - object to get values from
            returnObj                               - if true and obj is not object returns obj
            properties...                           - one or more property to get in format
                format:
                    'propertyName'                  - returns 'propertyName' object property or null
                    'propertyName1,propertyName2'   - returns first set object property or null
        @return
            depending on <properties...> returns single value or array of specified properties values

        @examples
            obj = 'some text'
            aRunD.getObjProp(obj, true, 'name')                         - 'some text'

            obj = {
                name    : 'my name',
                title   : 'my title',
                email   : 'mail@mail.com',
                login   : 'nickname'
            }
            aRunD.getObjProp(obj, false, 'text')                            - null
            aRunD.getObjProp(obj, false, 'title')                           - 'my title'
            aRunD.getObjProp(obj, true, 'title')                            - 'my title'
            aRunD.getObjProp(obj, false, 'login,email')                     - 'nickname'
            aRunD.getObjProp(obj, false, 'description,title')               - 'my title', because object doesn't have 'description' property
            aRunD.getObjProp(obj, false, 'login', 'email')                  - ['nickname', 'mail@mail.com']
            aRunD.getObjProp(obj, false, 'name', 'login,email', 'title')    - ['nickname', 'nickname', 'my title']
            aRunD.getObjProp(obj, false, 'name', 'phone,email', 'address')  - ['nickname', 'mail@mail.com', null]
    */
    getObjProp                                      : function(obj, returnObj){
        if( typeof(obj) !== 'object' || arguments.length < 3 ){
            return returnObj ? obj : null;
        }
        var
            check                                   = function(obj, prop){
                prop                                = prop.split(',');
                var value                           = null;
                for (var j = 0; j < prop.length; j++) {
                    if( typeof(obj[prop[j]]) !== 'undefined' ){
                        return obj[prop[j]];
                    }
                }
                return value;
            },
            from                                    = 2,
            length                                  = arguments.length - from,
            args                                    = new Array(length),
            i
        ;
        for (i = 0; i < length; i++) {
            args[i]                          = arguments[i + from];
        }
        if( length === 1 ){
            return check(obj, args[0]);
        }else{
            var ret                                 = [];
            for (i = 0; i < length; i++) {
                ret.push( check(obj, args[i]) );
            }
            return ret;
        }
    },
    dfdGroup                                        : function(dfds, dfd){
        return jQuery.when.apply( jQuery, dfds )
            .done(function(){
                if( dfd.state() === "pending" ){
                    dfd.resolve();
                }
            })
            .fail(function(){
                if( dfd.state() === "pending" ){
                    dfd.reject(arguments);
                }
            })
        ;
    },
    hasAttrContent                                  : function(el, value, attrCheck){
        var
            $el                                     = jQuery(el),
            ret                                     = false
        ;
        if( !( attrCheck.length && $el.is('[' + attrCheck.join('],[') + ']') ) ){
            return ret;
        }
        var patt                                    = new RegExp("([;]|^){1}" + value.replace(/['"]+/g, '') + "([:;]|$){1}");
        jQuery.each(attrCheck, function(i, name){
            var testStr                             = $el.attr(name);
            if( typeof(testStr) === 'string' && patt.test(testStr)){
                ret                                 = true;
                return false;
            }
        });
        return ret;
    },
    loadImage                                       : function(src){
        var dfd                                     = jQuery.Deferred(),
            imageSrc                                = src
        ;
        jQuery('<img>')
            .on({
                'load'                              : function(){
                    dfd.resolve(imageSrc);
                    jQuery(this).remove();
                },
                'error'                             : function(){
                    dfd.reject();
                    jQuery(this).remove();
                }
            })
            .attr('src', imageSrc)
        ;
        return dfd;
    }
};

if (!Object.keys) {
    Object.keys = function(obj) {
        var keys = [];

        for(var i in obj){
            if(obj.hasOwnProperty(i)){
                keys.push(i);
            }
        }

        return keys;
    };
}

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); };
}

//only for filtration, heavy usage if checks a lot of elements
jQuery.expr[':']['ao-has-attr-content']             = function (a,i,m) {
    var
        attrCheck                                   = m[3].split(','),
        value                                       = attrCheck[0]
    ;
    return aRunD.hasAttrContent(a, value, attrCheck.slice(1));
};

jQuery.fn.aoInit                                    = function(findFn, silent){
    if( !aRunD.hasElements(this, "aRunD: init - Nothing selected.") ){
        return this;
    }
    var _findFn                                     = 'find',
        i;
    if( findFn && jQuery.inArray(findFn, ['filter']) > -1 ){
        _findFn                                     = findFn;
    }
    if( silent ){
        for (i = 0; i < this.length; i++) {
            aRunD.runFlist('init', jQuery(this[i]), _findFn);
        }
    }else{
        jQuery(this).trigger('aoInitStart');
        for (i = 0; i < this.length; i++) {
            var $container                          = jQuery(this[i]);
            $container.trigger('aoBeforeInit');
            aRunD.runFlist('init', $container, _findFn);
            $container.trigger('aoAfterInit');
        }
        jQuery(this).trigger('aoInitEnd');
    }
    return this;
};

aRunD.$w.on('load', function(){
    aRunD.loaded                                    = true;
});