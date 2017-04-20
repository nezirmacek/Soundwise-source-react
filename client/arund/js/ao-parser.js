/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Parser requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Parser requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    var setOptions                                          = function (context, initOpts, defaults){
            var options                                     = $.extend({}, defaults || {}, initOpts || {});
            $.each(options, function (name, val){
                if( typeof(context[name]) === 'function' ){
                    context[name](val);
                }
            });
            return context;
        }
    ;
    /* ValueCheck */
        var ValueCheck                                      = function (options, name){
                setOptions(this, options, {
                    name                                    : name || null,
                    type                                    : typeof(options === 'string') ? options : null
                });
            },
            isCheck                                         = function (val){
                return !!(val instanceof ValueCheck);
            }
        ;
        ValueCheck.prototype                                = {
            name                                            : function (val){
                var type                                    = typeof val;
                switch( type ){
                    case 'undefined':
                        return this._name || this._type || '__anonimous__';
                    case 'string':
                        this._name                          = val;
                        break;
                    default:
                        this._name                          = null;
                        break;
                }
                return this;
            },
            type                                            : function (val){
                var type                                    = typeof val;
                switch( type ){
                    case 'undefined':
                        return this._type;
                    case 'string':
                        this._type                          = val;
                        break;
                    default:
                        this._type                          = null;
                        break;
                }
                return this;
            },
            regular                                         : function (val){
                var type                                    = typeof val;
                switch( type ){
                    case 'undefined':
                        return this._regular;
                    case 'string':
                        this._reg                           = new RegExp(val);
                        this._regular                       = val;
                        break;
                    default:
                        this._reg                           = null;
                        this._regular                       = null;
                        break;
                }
                return this;
            },
            allowed                                         : function (val){
                if( typeof val === 'undefined' ){
                    return this._allowed;
                }
                if( val instanceof Array && val.length ){
                    this._allowed                           = val;
                }else{
                    this._allowed                           = null;
                }
                return this;
            },
            check                                           : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._check;
                }
                if( type === 'function' ){
                    this._check                             = {
                        test                                : val
                    };
                }else if( isCheck(val) ){
                    this._check                             = val;
                }else{
                    this._check                             = null;
                }
                return this;
            },
            keyObj                                          : function (val){
                var type                                    = typeof val;
                switch( type ){
                    case 'undefined':
                        return this._keys;
                    case 'object':
                        this._keys                          = val;
                        break;
                    default:
                        this._keys                          = null;
                        break;
                }
                return this;
            },
            test                                            : function (val){
                var context                                 = this,
                    value                                   = aRD.toJsValue(val)
                ;
                return  (typeof value !== 'undefined' && !(context._type || context._reg || context._allowed || context._keys || context._check)) ||
                        (context._type && aRD.checkType(context._type, value)) ||
                        (context._reg && typeof value === 'string' && context._reg.test(value) ) ||
                        (context._allowed && $.inArray(value, context._allowed) !== -1) ||
                        (context._keys && context._keys[value]) ||
                        (context._check && context._check.test(value))
                ;
            },
            parser                                          : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._parser;
                }
                if( type === 'function' ){
                    this._parser                            = val;
                }
                return this;
            },
            stringifier                                     : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._stringifier;
                }
                if( type === 'function' ){
                    this._stringifier                       = val;
                }
                return this;
            },
            parse                                           : function (val){
                var value                                   = aRD.toJsValue(val);
                if( this._parser ){
                    return this._parser(value);
                }
                var type                                    = this._type;
                return type && aRD.hasType(type) ? aRD.type(type).parse(value) : value;
            },
            stringify                                       : function (val){
                if( this._stringifier ){
                    return this._stringifier(val);
                }
                var type                                    = this._type;
                return type && aRD.hasType(type) ? aRD.type(type).stringify(val) : aRD.stringify(val);
            }
        };

    /* PropertyCheck */
        var PropertyCheck                                   = function (options){
                this._list                                  = [];
                setOptions(this, options);
            }
        ;
        PropertyCheck.prototype                             = {
            name                                            : function (val){
                var type                                    = typeof val;
                switch( type ){
                    case 'undefined':
                        return this._name;
                    case 'string':
                        this._name                          = val;
                        break;
                    default:
                        this._name                          = null;
                        break;
                }
                return this;
            },
            checks                                          : function (val){
                if( typeof val === 'undefined' ){
                    return this._list;
                }
                this._list                                  = [];
                if( val instanceof Array && val.length ){
                    for (var i = 0; i < val.length; i++) {
                        this.addCheck(val[i]);
                    }
                }else{
                    this.addCheck(val);
                }
                return this;
            },
            addCheck                                        : function (val){
                if( val instanceof ValueCheck ){
                    this._list.push(val);
                }else if( val && typeof val === 'object' ){
                    this._list.push(new ValueCheck(val));
                }
                return this;
            },
            parse                                           : function (val){
                var name                                    = this._name,
                    value                                   = val
                ;
                if( this._list.length ){
                    for (var i = 0; i < this._list.length; i++) {
                        if( this._list[i].test( value ) ){
                            return {
                                name                        : this._list[i].name(),
                                value                       : this._list[i].parse(value)
                            };
                        }
                    }
                }
                return {
                    name                                    : name,
                    value                                   : aRD.toJsValue(value)
                };
            },
            stringify                                       : function (val){
                var name                                    = this._name,
                    value                                   = val,
                    lName, lValue
                ;
                if( this._list.length ){
                    for (var i = 0; i < this._list.length; i++) {
                        lName                               = this._list[i].name();
                        lValue                              = val[ lName ];
                        if( this._list[i].test( lValue ) ){
                            lValue                          = this._list[i].stringify(lValue);
                            if( lValue ){
                                return {
                                    name                    : lName,
                                    value                   : lValue
                                };
                            }
                        }
                    }
                }
                return {
                    name                                    : name,
                    value                                   : aRD.stringify(value)
                };
            }
        };

    /* DataCheck */
        var DataCheck                                       = function (options){
                this._list                                  = [];
                setOptions(this, options);
            }
        ;
        DataCheck.prototype                                 = {
            maxLength                                       : function (val){
                var type                                    = typeof val;
                switch( type ){
                    case 'undefined':
                        return this._maxLength;
                    case 'number':
                        this._maxLength                     = val;
                        break;
                    default:
                        this._maxLength                     = null;
                        break;
                }
                return this;
            },
            list                                            : function (val){
                if( typeof val === 'undefined' ){
                    return this._list;
                }
                this._list                                  = [];
                if( val instanceof Array && val.length ){
                    for (var i = 0; i < val.length; i++) {
                        this.addPropertyCheck(val[i]);
                    }
                }else if( val && typeof val === 'object' ){
                    this.addPropertyCheck(val);
                }
                return this;
            },
            addPropertyCheck                                : function (val, pos){
                var property                                = null;
                if( val instanceof PropertyCheck ){
                    property                                = val;
                }else if( val && typeof val === 'object' ){
                    property                                = new PropertyCheck(val);
                }else if( typeof val === 'string' ){
                    property                                = new PropertyCheck({
                        name                                : val
                    });
                }
                if( property ){
                    if( typeof pos === 'number' ){
                        this._list.splice(pos, 0, property);
                    }else{
                        this._list.push(property);
                    }
                }
                return this;
            },
            parse                                           : function (val){
                if( !( this._list.length && val instanceof Array && val.length ) ){
                    return {};
                }
                var
                    ret                                     = {},
                    length                                  = this._maxLength !== null && val.length > this._maxLength ? this._maxLength : val.length,
                    i                                       = 0,
                    k                                       = 0,
                    property, j
                ;
                val                                         = val.slice(0, length);
                while( i < this._list.length && k < val.length ){
                    if( !this._list[i] ){
                        break;
                    }
                    if(val[k] === '-'){
                        ++i;
                        ++k;
                        continue;
                    }
                    property                                = this._list[i].parse( val[k] );
                    if( property.name instanceof Array ){
                        for (j = 0; j < property.name.length; j++) {
                            if( !ret[property.name[j]] ){
                                property.name               = property.name[j];
                            }
                        }
                        //if not found set to last possible
                        if( property.name instanceof Array ){
                            property.name                   = property.name[j];
                        }
                    }
                    ++i;
                    if( typeof(property.name) === 'string' ){
                        ret[property.name]                  = property.value;
                        ++k;
                    }
                }
                return ret;
            },
            stringify                                       : function (val){
                if( !this._list.length || typeof val !== 'object' ){
                    return '';
                }
                var ret                                     = [],
                    obj                                     = $.extend(true, {}, val),
                    i                                       = 0,
                    k                                       = 0,
                    c                                       = 0,
                    property
                ;
                while( i < this._list.length ){
                    if( !this._list[i] ){
                        break;
                    }
                    property                                = this._list[i].stringify( obj );
                    if( typeof(property.name) === 'string' ){
                        for (c = i - 1; c >= k; c--) {
                            // check if skipped check can parse value
                            if( typeof( this._list[c].parse( property.value ).name ) === 'string' ){
                                for (; c >= k; c--) {
                                    ret.push( '-' );
                                }
                                break;
                            }
                        }
                        k                                   = i+1;
                        ret.push( property.value );
                        delete obj[property.name];
                    }
                    ++i;
                }

                return ret.join(' ');
            }
        };

    /* StructuredProperty */
        var StructuredProperty                              = function (options){
                setOptions(this, options, {
                    type                                    : 'datastring'
                });
            },
            parseDataString                                 = function (val){
                var value                                   = aRD.splitWords(val);
                if( this._dataCheck ){
                    return this._dataCheck.parse(value);
                }
                return value;
            },
            parseDefault                                    = function (val){
                if( aRD.hasType(this._type) ){
                    if( aRD.type(this._type).test(val) ){
                        return aRD.type(this._type).parse(val);
                    }else{
                        return null;
                    }
                }else{
                    return aRD.toJsValue(val);
                }
            },
            parseBool                                       = function (val){
                return !!(!val || val === '0' || val === 'false');
            },
            stringifyDataString                             = function (val){
                if( this._dataCheck ){
                    return this._dataCheck.stringify(val);
                }
                return "" + val;
            },
            stringifyDefault                                = function (val){
                if( aRD.hasType(this._type) ){
                    if( aRD.type(this._type).test(val) ){
                        return aRD.type(this._type).stringify(val);
                    }else{
                        return '';
                    }
                }else{
                    return aRD.stringify(val);
                }
            },
            stringifyBool                                    = function (val){
                return val ? '1' : '0';
            }
        ;
        StructuredProperty.prototype                        = {
            data                                            : function (val){
                if( typeof val === 'undefined' ){
                    return this._data;
                }
                this._data                                  = val;
                return this;
            },
            type                                            : function (val){
                if( val instanceof DataCheck ){
                    this._type                              = 'datastring';
                    this._dataCheck                         = val;
                }else{
                    var type                                = typeof val;
                    switch( type ){
                        case 'undefined':
                            return this._type;
                        case 'string':
                            this._type                      = val;
                            break;
                        case 'function':
                            this._type                      = 'process';
                            break;
                        case 'object':
                            this._type                      = 'datastring';
                            this._dataCheck                 = new DataCheck(val);
                            break;
                        default:
                            this._type                      = null;
                            break;
                    }
                }
                switch( this._type ){
                    case 'bool'                             :
                        this.parse                          = parseBool;
                        this.stringify                      = stringifyBool;
                        break;
                    case 'process'                          :
                        this.parse                          = val;
                        this.stringify                      = val;
                        break;
                    case 'datastring'                       :
                        this.parse                          = parseDataString;
                        this.stringify                      = stringifyDataString;
                        break;
                    default                                 :
                        this.parse                          = parseDefault;
                        this.stringify                      = stringifyDefault;
                        break;
                }
                return this;
            },
            allowEmpty                                      : function (val){
                if( typeof val === 'undefined' ){
                    return typeof this._allowEmpty === 'boolean' ? this._allowEmpty : this._type === 'datastring';
                }
                this._allowEmpty                            = !!val;
                return this;
            },
            dataCheck                                       : function (){
                if( !this._dataCheck ){
                    this._dataCheck                         = new DataCheck();
                }
                return this._dataCheck;
            }
        };

    /* StructuredData */
        var StructuredData                                  = function (options){
                this._list                                  = {};
                setOptions(this, options);
            }
        ;
        StructuredData.prototype                            = {
            keyCheck                                        : function (val){
                if( typeof val === 'undefined' ){
                    return this._keyCheck;
                }
                if( val instanceof ValueCheck ){
                    this._keyCheck                          = val;
                }else if( val && typeof val === 'object' ){
                    this._keyCheck                          = new ValueCheck(val);
                }
                return this;
            },
            default                                         : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._default;
                }
                if( val instanceof StructuredProperty ){
                    this._default                           = val;
                }else if( type === 'object' ){
                    this._default                           = new StructuredProperty(val);
                }else{
                    this._default                           = null;
                }
                return this;
            },
            properties                                      : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._list;
                }
                this._list                                  = {};
                if( type === 'object' ){
                    var context                             = this;
                    $.each(val, function (name, item){
                        context.addProperty(name, item);
                    });
                }
                return this;
            },
            addProperty                                     : function (name, item){
                if(item instanceof ValueCheck || item instanceof StructuredProperty){
                    this._list[name]                        = item;
                }else{
                    var type                                = typeof item;
                    switch(type){
                        case 'string':
                            this._list[name]                = new StructuredProperty({
                                type                        : item
                            });
                            break;
                        case 'object':
                            this._list[name]                = new StructuredProperty(item);
                            break;
                    }
                }
                return this;
            },
            parse                                           : function (val, asArray){
                if( typeof(val) !== 'string' ){
                    return {};
                }
                var
                    raw                                     = aRD.splitText(val, ';'),
                    tmp                                     = null,
                    name                                    = null,
                    value                                   = null,
                    ret                                     = asArray ? [] : {},
                    parser, setName, setKey
                ;

                for (var i = 0; i < raw.length; i++) {
                    tmp                                     = raw[i].split(':');
                    if( tmp.length > 0 ){
                        name                                = $.trim(tmp[0]);
                        if( name ){
                            value                           = tmp.length > 1 ? $.trim( tmp.slice(1).join(':') ) : true;
                            if( value === '' ){
                                value                       = true;
                            }else{
                                setName                     = false;
                                if( this._keyCheck && typeof(value) === 'string' ){
                                    tmp                     = aRD.splitWords(value);
                                    setKey                  = this._keyCheck.name();
                                    setName                 = name;
                                    if( !this._keyCheck.test(name) && tmp.length && this._keyCheck.test(tmp[0]) ){
                                        setName             = tmp[0];
                                        value               = tmp.slice(1).join(' ');
                                    }
                                }
                                parser                      = this._list[setName || name] || this._default;
                                if( parser ){
                                    value                   = parser.parse(value);
                                    if( setName && setName !== name && this._list[setName] && this._list[setName].type() === 'datastring' ){
                                        value[setKey]       = setName;
                                    }
                                }else{
                                    value                   = aRD.toJsValue(value);
                                }
                            }
                            if( asArray ){
                                ret.push({
                                    name                    : name,
                                    value                   : value
                                });
                            }else{
                                ret[name]                   = value;
                            }
                        }
                    }
                }

                return ret;
            },
            stringify                                       : function (val){
                if( typeof(val) !== 'object' ){
                    return val;
                }
                var values                                  = $.extend(true, {}, val),
                    ret                                     = [],
                    name, setName, value, str, parts, setKey, parser
                ;
                for (name in values) {
                    value                                   = val[name];
                    str                                     = aRD.stringify(name);
                    parts                                   = [];
                    setName                                 = false;
                    if( value && typeof value === 'object' && this._keyCheck ){
                        setKey                              = this._keyCheck.name();
                        setName                             = name;
                        if( !this._keyCheck.test(name) && value[setKey] && this._keyCheck.test(value[setKey]) ){
                            setName                         = value[setKey];
                            parts.push(setName);
                            delete value[setKey];
                        }
                    }
                    parser                                  = this._list[setName || name] || this._default;
                    if( parser ){
                        value                               = parser.stringify(value);
                        if( !(value || parser.allowEmpty()) ){
                            continue;
                        }
                    }else{
                        value                               = aRD.stringify(value);
                    }
                    if( value ){
                        parts.push(value);
                    }
                    if( parts.length ){
                        str                                 += ':' + parts.join(' ');
                    }
                    ret.push(str);
                }
                return ret.join(';');
            }
        };

    /* ValueCheck global */
        var checksList                                      = {},
            provideCheck                                    = function (name, options){
                if( !checksList[name] ){
                    checksList[name]                        = new ValueCheck(options, name);
                }else if( options ){
                    setOptions(checksList[name], typeof options === 'string' ? {
                        type                                : options
                    } : options );
                }
                return checksList[name];
            }
        ;
        provideCheck('display', {
            allowed                                         : ['block', 'none', 'inline', 'inline-block', 'table', 'table-cell']
        });
        provideCheck('insert', {
            allowed                                         : ['append', 'prepend', 'before', 'after']
        });
        provideCheck('range');
        provideCheck('vAction', {
            check                                           : function (value){
                var type                                    = typeof(value);
                return type === 'boolean' || value === 'show' || value === 'hide';
            },
            parser                                          : function (value){
                if(typeof(value) === 'string'){
                    return value === 'show' ? true : false;
                }
                return !!value;
            },
            stringifier                                     : function (value){
                return value && value !== 'hide' ? 'show' : 'hide';
            }
        });

    /* Extend aRunD with parsers */
        var stringParser                                    = new StructuredData(),
            fromString                                      = function (val, parser){
                if( typeof parser === 'undefined' ){
                    return stringParser.parse(val);
                }else if(
                    parser instanceof ValueCheck ||
                    parser instanceof PropertyCheck ||
                    parser instanceof DataCheck ||
                    parser instanceof StructuredProperty ||
                    parser instanceof StructuredData
                    ){
                    return parser.parse(val);
                }
                return val;
            }
        ;
        aRD.parser                                          = {
            newCheck                                        : function (name, options){
                return new ValueCheck(options, name);
            },
            newPropertyCheck                                : function (options){
                return new PropertyCheck(options);
            },
            newDataCheck                                    : function (options){
                return new DataCheck(options);
            },
            newProperty                                     : function (options){
                return new StructuredProperty(options);
            },
            newData                                         : function (options){
                return new StructuredData(options);
            },
            check                                           : provideCheck,
            hasCheck                                        : function (name){
                return !!checksList[name];
            },
            isCheck                                         : isCheck,
            parse                                           : fromString,
            fromAttr                                        : function ($el, name, parser){
                if( !aRD.hasDataString($el, name) ){
                    return null;
                }
                return fromString($el.data(name), parser);
            },
            stringify                                       : function (val, parser){
                if( typeof parser === 'undefined' ){
                    return stringParser.stringify(val);
                }else if(
                    parser instanceof ValueCheck ||
                    parser instanceof PropertyCheck ||
                    parser instanceof DataCheck ||
                    parser instanceof StructuredProperty ||
                    parser instanceof StructuredData
                    ){
                    return parser.stringify(val);
                }
                return JSON.stringify(val);
            }
        };
}));