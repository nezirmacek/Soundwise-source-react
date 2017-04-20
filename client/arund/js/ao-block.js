/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD, tmpl, FB, gapi */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Block requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Block requires aRunD to be loaded first';
    }
    if (typeof tmpl === 'undefined') {
        throw 'aRunD Block requires JavaScript Templates to be loaded first';
    }
    fn(jQuery, aRunD, tmpl);
}(function ($, aRD, tmpl) {
    /* General */
        var findBlock                                       = function (blockName){
                if( !blockName ){
                    return jQuery([]);
                }
                var blocks                                  = blockName.split(';');
                if( blocks.length > 1 ){
                    //if more than 1 block - search for each
                    var
                        $block,
                        $blocks                             = jQuery([])
                    ;
                    for (var i = 0; i < blocks.length; i++) {
                        $block                              = findBlock(blocks[i]);
                        if( $block ){
                            $blocks                         = $blocks.add( $block );
                        }
                    }
                    return $blocks;
                }
                blockName                                   = blockName.split(':')[0];
                return jQuery('[data-ao-block="' + blockName + '"]').eq(0);
            },
            findBlockGroup                                  = function (groupName){
                return jQuery('[data-ao-block-group="' + groupName + '"]');
            },
            pingBlockEvent                                  = function ($el, eventName, params){
                var name                                    = $el.trigger(eventName, params).data('aoBlock');
                if( name ){
                    aRD.$doc.trigger(eventName + name, params);
                }
                aRD.$doc.trigger(eventName + '__gl', params);
            },
            toggleBlockRelatedStatus                        = function ($block, state){
                if( !($block.length || $block.data('aoBlock')) ){
                    return $block;
                }
                var blockName                               = $block.data('aoBlock'),
                    dataAttrs                               = [
                        'data-ao-related-block',
                        'data-ao-show-block',
                        'data-ao-hide-block',
                        'data-ao-toggle-block'
                    ],
                    selectors                               = ':ao-has-attr-content("' + blockName + '",' + dataAttrs.join(',') + ')',
                    $els                                    = jQuery( '[' + dataAttrs.join('],[') + ']' ).filter(selectors),
                    $radios                                 = $els.filter('[type="radio"]'),
                    $checked                                = jQuery([])
                ;
                state                                       = typeof(state) === 'boolean' ? state : $block.is(':hidden');
                $els.each(function (i, $rBlock){
                    $rBlock                                 = jQuery($rBlock);
                    var
                        shownClass                          = $rBlock.data('aoRelatedShownClass'),
                        hiddenClass                         = $rBlock.data('aoRelatedHiddenClass'),
                        toggledClass                        = $rBlock.data('aoRelatedToggledClass')
                    ;
                    if( toggledClass ){
                        $rBlock.toggleClass(toggledClass, state);
                    }
                    if( shownClass ){
                        $rBlock.toggleClass(shownClass, state);
                    }
                    if( hiddenClass ){
                        $rBlock.toggleClass(hiddenClass, !state);
                    }
                    if( $rBlock.is('option, [type="checkbox"], [type="radio"]') && !$rBlock.is('[data-ao-block-no-check]') ){
                        if( $checked.filter($rBlock).length ){
                            return;
                        }
                        var
                            prop                            = $rBlock.is('option') ? 'selected' : 'checked',
                            value                           = aRD.hasAttrContent($rBlock, blockName, ['data-ao-hide-block']) ? !state : state
                        ;
                        if( $rBlock.prop( prop ) !== value ){
                            if($rBlock.is('[type="radio"]')){
                                var $related                = $rBlock.closest('form, body').find( $radios ).filter('[name="' + $rBlock.attr('name') +'"]');
                                $checked                    = $checked.add($related);
                                if( $related.length > 1 ){
                                    var
                                        $hRel               = $related.filter(':ao-has-attr-content("' + blockName + '",data-ao-hide-block)'),
                                        $sRel               = $related.filter(':ao-has-attr-content("' + blockName + '",data-ao-show-block)')
                                    ;
                                    if((
                                            state && ( $hRel.not(':checked').length || $sRel.filter(':checked').length )
                                        ) || (
                                            !state && ( $hRel.filter(':checked').length || $sRel.not(':checked').length )
                                        )
                                    ){
                                        return;
                                    }
                                }
                            }
                            $rBlock.prop( prop, value).aoTriggerChange();
                        }
                    }
                });
            }
        ;
    
    /* Show/hide */
        var checkShow                                       = function ($block, force){
                var check                                   = !!force;
                if( force && typeof(force) === 'string' ){
                    var obj                                 = $block.data( 'aoShow__Checks' ) || {};
                    if( obj[force] ){
                        check                               = false;
                    }else{
                        obj[force]                          = check;
                        $block.data( 'aoShow__Checks', obj );
                    }
                }
                return $block.data( 'aoHide__InProggress' ) || $block.is(':hidden') || check;
            },
            showBlock                                       = function ($block, action, force, onComplete){
                if( !checkShow($block, force) ){
                    return $block;
                }
                $block.data( 'aoHide__InProggress', null );
                pingBlockEvent($block, 'aoBlockPreShow', [{'action' : action}]);
                $block.aoShow( false, function ($el) {
                    toggleBlockRelatedStatus($el, true);
                    pingBlockEvent($el, 'aoBlockShow', [{'action' : action}]);
                    aRD.apply(onComplete, $el);
                    if( $el.is('[data-ao-animaze-shownresize]') ){
                        $el
                            .off('aoresize.aoShownActs')
                            .on({
                                'aoresize.aoShownActs'          : function (){
                                    jQuery(this).aoAnimaze('shownresize');
                                },
                                'aoBlockPreHide.aoShownActs'    : function (){
                                    jQuery(this).off('aoresize.aoShownActs');
                                }
                            })
                            .aoAnimaze('shownresize')
                        ;
                    }
                    aRD.$w.trigger('aoSetSizes');
                }, force);
                return $block;
            },
            hideBlock                                       = function ($block, action, onComplete){
                if( !$block.is(':visible') || $block.data( 'aoHide__InProggress') ){
                    return $block;
                }
                $block.data( 'aoShow__Checks', null );
                $block.data( 'aoHide__InProggress', true );
                pingBlockEvent($block, 'aoBlockPreHide', [{'action' : action}]);
                $block.aoHide( false, function ($el) {
                    $el.data( 'aoHide__InProggress', null );
                    toggleBlockRelatedStatus($el, false);
                    pingBlockEvent($el, 'aoBlockHide', [{'action' : action}]);
                    if( aRD.css.isAnimated ){
                        $el.filter('.' + aRD.css.isAnimated)
                            .add( $el.find('.' + aRD.css.isAnimated) )
                            .aoAnimazeFinish()
                        ;
                    }
                    aRD.apply(onComplete, $el);
                    if( $el.is( aRD.selectors.template ) ){
                        $el.remove();
                    }
                });
                return $block;
            }
        ;

    /* Templates */
        var templateCache                                   = {},
            loadSubs                                        = function ($block, options){
                var dfd                                     = jQuery.Deferred(),
                    $els                                    = $block.filter('[data-ao-load-template]')
                ;
                $els                                        = $els.add( $block.not($els).find('[data-ao-preload-template]') );
                if( $els.length ){
                    var count                               = 0,
                        alwaysFn                            = function (){
                            ++count;
                            if( count === $els.length ){
                                dfd.resolve();
                            }
                        }
                    ;
                    $els.each(function (i, el){
                        var $el                             = jQuery(el),
                            property                        = $el.data('aoLoadTemplateProperty')
                        ;
                        createBlockTemplate($el.data('aoPreloadTemplate'), options[property] || options)
                            .done(function ($_block){
                                $el
                                    .empty()
                                    .append($_block)
                                ;
                            })
                            .always(alwaysFn)
                        ;
                    });
                }else{
                    dfd.resolve();
                }
                return dfd;
            },
            loadImages                                      = function ($block){
                var dfd                                     = jQuery.Deferred(),
                    $els                                    = $block.find('img')
                ;
                if( $els.length ){
                    var count                               = 0,
                        alwaysFn                            = function (){
                            ++count;
                            if( count === $els.length ){
                                dfd.resolve();
                            }
                        }
                    ;
                    $els.each(function (i, el){
                        aRD.loadImage(jQuery(el).attr('src')).always(alwaysFn);
                    });
                }else{
                    dfd.resolve();
                }
                return dfd;
            },
            createBlockTemplate                             = function (templateName, options){
                var dfd                                     = jQuery.Deferred(),
                    loadDfd                                 = jQuery.Deferred()
                ;
                if( templateCache[templateName] ){
                    loadDfd.resolve();
                }else{
                    //TODO AJAX template loading
                    var $template                           = templateName instanceof jQuery ? templateName : jQuery('[data-ao-template="' + templateName + '"]');
                    if( !$template.length ){
                        return dfd.reject();
                    }
                    templateCache[templateName]             = tmpl( $template.html() );
                    loadDfd.resolve();
                }
                loadDfd
                    .done(function (){
                        var $block                          = jQuery( templateCache[templateName](options || {}) ),
                            subsDfd                         = loadSubs($block, options),
                            imgDfd                          = loadImages($block)
                        ;
                        if( aRD.form ){
                            $block.find('select[value]').each(function(i, sel){
                                var $sel                    = $(sel);
                                aRD.form.setValue($sel, $sel.attr('value'));
                            });
                        }
                        dfd.fail(function (){
                            subsDfd.reject();
                            imgDfd.reject();
                        });
                        jQuery.when(subsDfd, imgDfd)
                            .always( function (){
                                dfd.resolve($block);
                            })
                        ;
                    })
                    .fail(function (){
                        dfd.reject();
                    })
                ;
                
                return dfd;
            }
        ;

    /* Toggle block */
        var allowedPositions                                = ['append', 'before', 'after', 'prepend'],
            loadingBlocks                                   = {},
            dataParser                                      = aRD.parser.newProperty({
                type                                        : {
                    maxLength                                   : 2,
                    list                                        : [
                        'blockName',
                        'action'
                    ]
                }
            }),
            createFromTemplate                              = function ($creator, templateName, options, $par, pos){
                var $parent                                 = $par && $par.length ? $par : $creator,
                    position                                = pos || $creator.data('aoInsertPosition')
                ;
                if( jQuery.inArray(position, allowedPositions) < 0 ){
                    position                                = $parent.is('script') ? 'after' : allowedPositions[0];
                }
                var params                                  = $.extend(true, {}, options || {}, {
                        '$creator'                          : $creator,
                        '$parent'                           : $parent,
                        'position'                          : position
                    })
                ;
                $parent.trigger('aoPreCreateBlock', [params]);
                return createBlockTemplate(templateName, params)
                    .done(function ($block){
                        $parent[position]( $block );
                        $block                              = $block
                            .filter('*')
                            .data({
                                'aoBlockCreator'            : $creator
                            })
                            .addClass(aRD.css.template)
                        ;
                        pingBlockEvent($block, 'aoCreateBlock');
                    })
                    .always(function(){
                        $parent = position = params = null;
                    })
                ;
            },
            toggleBlock                                     = function ($el, options, state, action, force){
                var dfd                                     = jQuery.Deferred(),
                    $block
                ;
                if( typeof(options) === 'string' ){
                    var blocks                              = options.split(';');
                    if( blocks.length > 1 ){
                        //if more than 1 block - run toggle for each block
                        var $blocks                         = jQuery([]),
                            count                           = 0,
                            doneFn                          = function ($_block){
                                $blocks                     = $blocks.add($_block);
                            },
                            alwaysFn                        = function (){
                                ++count;
                                if( count === blocks.length ){
                                    dfd.resolve($blocks);
                                }
                            }
                        ;
                        for (var i = 0; i < blocks.length; i++) {
                            toggleBlock($el, blocks[i], state)
                                .done(doneFn)
                                .always(alwaysFn)
                            ;
                        }
                        return dfd;
                    }
                    var tmp                                 = options.split(':');
                    options                                 = {
                        blockName                           : tmp[0],
                        templateName                        : tmp.length > 1 ? tmp[1] : tmp[0]
                    };
                }
                if( options && options.blockName && loadingBlocks[options.blockName] ){
                    loadingBlocks[options.blockName].always(function (){
                        toggleBlock($el, options, state, action, force)
                            .done(function ($_block){
                                dfd.resolve($_block);
                            })
                            .fail(function (){
                                dfd.reject();
                            })
                        ;
                    });
                    return dfd;
                }
                $block                                      = options && options.blockName ? jQuery('[data-ao-block="' + options.blockName + '"]').eq(0) : $el;
                state                                       = typeof(state) === 'boolean' ? state : !$block.is(':visible');

                if( state ){
                    if( $block.length ){
                        dfd.resolve($block);
                    }else if( options && options.templateName && !$block.length ){
                        dfd                                 = createFromTemplate($el, options.templateName, null, aRD.find($el, aRD.selectors.block, 'closest'));
                        loadingBlocks[options.blockName] = dfd;
                        dfd
                            .done(function ($_block){
                                $_block
                                    .attr('data-ao-block', options.blockName)
                                    .aoInit('filter')
                                    .aoInit()
                                ;
                                if( typeof(FB) === 'object' ){
                                    FB.XFBML.parse($_block[0]);
                                }
                                if( typeof(gapi) === 'object' ){
                                    gapi.plusone.go();
                                }
                            })
                            .always(function (){
                                delete loadingBlocks[options.blockName];
                            })
                        ;
                    }else{
                        dfd.reject();
                    }
                    dfd
                        .done(function ($_block){
                            if( $_block.is(':hidden') && $_block.data('aoToggleGroup') ){
                                jQuery('[data-ao-toggle-group="' + $_block.data('aoToggleGroup') + '"]:visible')
                                    .not($_block)
                                    .each(function (i, $hideBlock){
                                        $hideBlock          = jQuery($hideBlock);
                                        hideBlock($hideBlock, action);
                                    })
                                ;
                            }
                            showBlock($_block, action, force);
                        })
                    ;
                }else if( $block.length ){
                    dfd.resolve($block);
                    hideBlock($block, action);
                }else{
                    dfd.reject();
                }

                return dfd;
            },
            triggerToggleBlock                              = function (el, opts, value, force){
                var
                    $el                                     = jQuery(el),
                    temp                                    = typeof(value) === 'undefined' ? true : value,
                    params                                  = typeof(opts) === 'object' ? opts : dataParser.parse(opts)
                ;

                if( $el.is('[type="checkbox"], [type="radio"]') ){
                    return toggleBlock($el, params.blockName, temp ? $el.is(':checked') : !$el.is(':checked'), params.action, force);
                }else if( $el.is('option') ){
                    return toggleBlock($el, params.blockName, temp ? $el.is(':selected') : !$el.is(':selected'), params.action, force);
                }else{
                    return toggleBlock($el, params.blockName, value, params.action, force);
                }
            }
        ;

    /* Add/remove */
        var addUniqueIds                                    = {},
            removeBlock                                     = function ($block){
                if( $block.data('aoBlockCreator') && $block.data('aoBlockGroup') ){
                    //Check if can remove block
                    var
                        min                                 = $block.data('aoBlockGroupMin') || false,
                        groupName                           = $block.data('aoBlockGroup')
                    ;
                    if( min && findBlockGroup(groupName).length <= min ){
                        return;
                    }
                }
                var id                                      = $block.data('ao__uniqueId');
                if( id && addUniqueIds[id] ){
                    delete addUniqueIds[id];
                }
                pingBlockEvent($block, 'aoRemoveBlock');
                $block.remove();
            },
            addBlock                                        = function ($el, settings){
                var $toEl                                   = settings.block ? findBlock(settings.block) : aRD.find($el, aRD.selectors.addBlockClosest, 'closest'),
                    count                                   = settings.group ? findBlockGroup(settings.group).length : null
                ;
                //Don't add-block if no template found or it reached max number of copies
                if( settings.max && settings.group && count >= settings.max ){
                    return;
                }
                var props                                   = $.extend(true, {}, settings, {
                        index                               : count
                    })
                ;
                var dfds                                    = [],
                    dfd                                     = $.Deferred()
                ;
                if( props.field && aRD.form ){
                    aRD.form.closestFields($el, props.field).triggerHandler('aoTemplateCreation', [props, dfds]);
                }
                props.uniqueId                              = aRD.randomId(addUniqueIds);
                addUniqueIds[props.uniqueId]                = true;
                jQuery.when.apply( jQuery, dfds ).done(function(){
                    createFromTemplate($el, props.template, props, $toEl, props.position)
                        .done(function($block){
                            if( props.group ){
                                $block.attr({
                                    'data-ao-block-group'       : props.group,
                                    'data-ao-block-group-min'   : props.min || null,
                                    'data-ao-block-group-max'   : props.max || null
                                });
                            }
                            $block
                                .data('ao__uniqueId', props.uniqueId)
                                .aoInit()
                                .on('destroyed', function(){
                                    var id                      = $(this).data('ao__uniqueId');
                                    if( id && addUniqueIds[id] ){
                                        delete addUniqueIds[id];
                                    }
                                })
                                .on('aoFormReset', function(e){
                                    e.stopPropagation();
                                    $(this).remove();
                                })
                            ;
                            $toEl.trigger('aoAddBlock');
                            dfd.resolve($block);
                        })
                        .reject(function(){
                            dfd.reject();
                            delete addUniqueIds[props.uniqueId];
                        })
                        .always(function(){
                            props = $toEl = null;
                        })
                    ;
                });
                return dfd;
            }
        ;

    /* Extend aRunD */
        aRD.css.template                                    = 'ao-template-block';
        
        aRD.selectors.template                              = '.' + aRD.css.template;
        aRD.selectors.block                                 = '.ao-block';
        aRD.selectors.addBlockClosest                       = aRD.selectors.block + ', ' + aRD.selectors.formGroup;
        aRD.selectors.removeBlockClosest                    = '.ao-block, .' + aRD.css.template;

        aRD.block                                           = {
            findGroup                                       : findBlockGroup,
            fromTemplate                                    : createFromTemplate,
            template                                        : createBlockTemplate,
            remove                                          : removeBlock,
            add                                             : addBlock,
            show                                            : showBlock,
            hide                                            : hideBlock,
            find                                            : findBlock,
            toggle                                          : toggleBlock,
            triggerToggle                                   : triggerToggleBlock
        };

    /* Extend jQuery */
        jQuery.fn.aoShowBlock                               = function (){
            jQuery(this).each(function (i, el){
                triggerToggleBlock(el, false, true);
            });
            return this;
        };

        jQuery.fn.aoHideBlock                               = function (){
            jQuery(this).each(function (i, el){
                triggerToggleBlock(el, false, false);
            });
            return this;
        };

        jQuery.fn.aoToggleBlock                             = function (){
            jQuery(this).each(function (i, el){
                triggerToggleBlock(el);
            });
            return this;
        };

        jQuery.fn.aoLoadTemplate                            = function (template, options){
            jQuery(this).each(function (i, el){
                var $el                                     = jQuery(el);
                createFromTemplate($el, template || $el.data('aoLoadTemplate'), options);
            });
            return this;
        };
    
    /* aRunD Init */
        var addDataParser                                   = aRD.parser.newData({
                properties                                  : {
                    template                                    : 'string',
                    block                                       : 'string',
                    group                                       : 'string',
                    min                                         : 'number',
                    max                                         : 'number',
                    position                                    : 'string',
                    field                                       : 'string',
                    strict                                      : 'boolean',
                    pref                                        : 'string',
                    fieldKey                                    : 'string'
                }
            })
        ;

        aRD.pushFlist('init', function ($container, findFn){
            $container[findFn]('[data-ao-load-template]').aoLoadTemplate();
            $container[findFn]('[data-ao-add-block]')
                .off('.aoAddBlock')
                .each(function (i, el){
                    var $el                                 = jQuery(el);
                    if( !aRD.hasDataString($el, 'aoAddBlock') ){
                        return;
                    }
                    var settings                            = addDataParser.parse( $el.data('aoAddBlock') );
                    $el.data('aoAddBlock__cache', settings);
                    if( settings.min && settings.group){
                        if( findBlockGroup(settings.group).length < settings.min ){
                            for (var j = 0; j < settings.min; j++) {
                                addBlock($el, settings);
                            }
                        }
                    }
                    if( settings.pref ){
                        $el.on('aoFormSet.aoAddBlock.pBlockForced', function(e, vals, opts){
                            e.stopPropagation();
                            var options                     = $.extend(true, {}, opts || {}),
                                values                      = aRD.getPropertyByName(vals, settings.pref, null, true, options)
                            ;
                            if( values ){
                                $.each(values, function(key, value){
                                    addBlock($el, $.extend(true, {}, settings, {
                                        key                 : aRD.getObjProp(value, false, settings.fieldKey || 'key') || key,
                                        value               : value
                                    }));
                                });
                            }
                        });
                    }
                })
                .on('aoChange.aoAddBlock.pBlockForced', {
                    preventOnlyLink     : true
                }, function (){
                    var $el                                 = $(this),
                        settings                            = $el.data('aoAddBlock__cache')
                    ;
                    addBlock($el, settings);
                })
            ;

            $container[findFn]('[data-ao-remove-block]').off('.pRemoveBlock').on('aoChange.pRemoveBlock.pBlockForced', {
                    preventOnlyLink     : true
                }, function (){
                    var
                        $el                                 = jQuery(this),
                        $toRemoveBlock                      = aRD.find($el, aRD.selectors.removeBlockClosest, 'closest')
                    ;
                    if( !$toRemoveBlock.length ){
                        return;
                    }
                    removeBlock($toRemoveBlock);
                }
            );

            $container[findFn]('[data-ao-show-block]').off('.pShowBlock').on('aoChange.pShowBlock.pBlockForced', {
                    preventOnlyLink     : true
                }, function (){
                    triggerToggleBlock(this, jQuery(this).data('aoShowBlock'), true);
                }
            );

            $container[findFn]('[data-ao-hide-block]').off('.pHideBlock').on('aoChange.pHideBlock.pBlockForced', {
                    preventOnlyLink     : true
                }, function (){
                    triggerToggleBlock(this, jQuery(this).data('aoHideBlock'), false);
                }
            );
            $container[findFn]('[data-ao-toggle-block]').off('.pToggleBlock').on('aoChange.pToggleBlock.pBlockForced', {
                    preventOnlyLink     : true
                }, function (){
                    triggerToggleBlock(this, jQuery(this).data('aoToggleBlock'));
                }
            );

            $container[findFn]('[data-ao-hide-toggle-group]').off('.pHideToggleGroup').on('aoChange.pHideToggleGroup.pBlockForced', {
                    preventOnlyLink     : true
                }, function (){
                    var
                        $el                                 = jQuery(this),
                        name                                = $el.data('aoHideToggleGroup')
                    ;
                    jQuery('[data-ao-toggle-group="' + name + '"]:visible')
                        .each(function (i, $hideBlock){
                            $hideBlock                      = jQuery($hideBlock);
                            hideBlock($hideBlock);
                        })
                    ;
                }
            );

            $container[findFn]('[data-ao-action-block-action]').each(function (i, el){
                jQuery(el).triggerHandler('aoChange.pBlockForced');
            });
        });
}));
