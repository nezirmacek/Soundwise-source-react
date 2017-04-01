/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD, tmpl */

(function(aRD){
    var
        __allowedPositions                          = ['append', 'before', 'after', 'prepend'],
        __templateCache                             = {},
        __loadingBlocks                             = {},
        __addBlockSettings                          = {
            type                                    : 'datastring',
            params                                  : {
                list                                    : [
                    { byCheck : {
                        name    : 'template',
                    }},
                    { byCheck : {
                        name    : 'block',
                    }},
                    aRD.checks.insert,
                    aRD.checks.range,
                    { byCheck : {
                        name    : 'group',
                    }},
                ]
            }
        },
        __checkShow                                 = function($block, force){
            var check                               = !!force;
            if( force && typeof(force) === 'string' ){
                var obj                             = $block.data( 'aoShow__Checks' ) || {};
                if( obj[force] ){
                    check                           = false;
                }else{
                    obj[force]                      = check;
                    $block.data( 'aoShow__Checks', obj );
                }
            }
            return $block.is(':hidden') || check;
        },
        __findBlockGroup                            = function(groupName){
            return jQuery('[data-ao-block-group="' + groupName + '"]');
        },
        __loadSubs                                  = function($block, options){
            var dfd                                 = jQuery.Deferred(),
                $els                                = $block.filter('[data-ao-load-template]')
            ;
            $els                                    = $els.add( $block.not($els).find('[data-ao-preload-template]') );
            if( $els.length ){
                var count                           = 0,
                    _alwaysFn                       = function(){
                        ++count;
                        if( count === $els.length ){
                            dfd.resolve();
                        }
                    }
                ;
                $els.each(function(i, el){
                    var $el                         = jQuery(el),
                        property                    = $el.data('aoLoadTemplateProperty')
                    ;
                    __createBlockTemplate($el.data('aoPreloadTemplate'), options[property] || options)
                        .done(function($_block){
                            $el
                                .empty()
                                .append($_block)
                            ;
                        })
                        .always(_alwaysFn)
                    ;
                });
            }else{
                dfd.resolve();
            }
            return dfd;
        },
        __loadImages                                = function($block){
            var dfd                                 = jQuery.Deferred(),
                $els                                = $block.find('img')
            ;
            if( $els.length ){
                var count                           = 0,
                    _alwaysFn                       = function(){
                        ++count;
                        if( count === $els.length ){
                            dfd.resolve();
                        }
                    }
                ;
                $els.each(function(i, el){
                    aRD.loadImage(jQuery(el).attr('src')).always(_alwaysFn);
                });
            }else{
                dfd.resolve();
            }
            return dfd;
        },
        __createBlockTemplate                       = function(templateName, options){
            var dfd                                 = jQuery.Deferred(),
                loadDfd                             = jQuery.Deferred()
            ;
            if( __templateCache[templateName] ){
                loadDfd.resolve();
            }else{
                //TODO AJAX template loading
                var $template                       = templateName instanceof jQuery ? templateName : jQuery('[data-ao-template="' + templateName + '"]');
                if( !$template.length ){
                    return dfd.reject();
                }
                __templateCache[templateName]       = tmpl( $template.html() );
                loadDfd.resolve();
            }
            loadDfd
                .done(function(){
                    var $block                      = jQuery( __templateCache[templateName](options || {}) ),
                        subsDfd                     = __loadSubs($block, options),
                        imgDfd                      = __loadImages($block)
                    ;
                    dfd.fail(function(){
                        subsDfd.reject();
                        imgDfd.reject();
                    });
                    jQuery.when(subsDfd, imgDfd)
                        .always( function(){
                            dfd.resolve($block);
                        })
                    ;
                })
                .fail(function(){
                    dfd.reject();
                })
            ;
            
            return dfd;
        },
        __createFromTemplate                        = function($creator, templateName, options, $par, pos){
            var dfd                                 = __createBlockTemplate(templateName, options)
                .done(function($block){
                    var position                    = pos || $creator.data('aoInsertPosition'),
                        $parent                     = $par && $par.length ? $par : $creator
                    ;
                    if( jQuery.inArray(position, __allowedPositions) < 0 ){
                        position                    = __allowedPositions[0];
                    }
                    $parent[position]( $block );
                    $block                          = $block
                        .filter('*')
                        .data({
                            'aoBlockCreator'                : $creator
                        })
                        .addClass(aRD.css.template)
                    ;
                    $block.trigger('aoCreateBlock');
                })
            ;
            return dfd;
        },
        __removeBlock                               = function($block){
            if( $block.data('aoBlockCreator') && $block.data('aoBlockGroup') ){
                //Check if can remove block
                var
                    min                             = $block.data('aoBlockGroupMin') || false,
                    groupName                       = $block.data('aoBlockGroup')
                ;
                if( min && __findBlockGroup(groupName).length <= min ){
                    return;
                }
            }
            $block.trigger('aoRemoveBlock').remove();
        },
        __toggleBlockRelatedStatus                  = function($block, state){
            if( !($block.length || $block.data('aoBlock')) ){
                return $block;
            }
            var
                blockName                           = $block.data('aoBlock'),
                dataAttrs                           = [
                    'data-ao-related-block',
                    'data-ao-show-block',
                    'data-ao-hide-block',
                    'data-ao-toggle-block'
                ],
                selectors                           = ':ao-has-attr-content("' + blockName + '",' + dataAttrs.join(',') + ')',
                $els                                = jQuery( '[' + dataAttrs.join('],[') + ']' ).filter(selectors),
                $radios                             = $els.filter('[type="radio"]'),
                $checked                            = jQuery([])
            ;
            state                                   = typeof(state) === 'boolean' ? state : $block.is(':hidden');
            $els.each(function(i, $rBlock){
                $rBlock                             = jQuery($rBlock);
                var
                    shownClass                      = $rBlock.data('aoRelatedShownClass'),
                    hiddenClass                     = $rBlock.data('aoRelatedHiddenClass'),
                    toggledClass                    = $rBlock.data('aoRelatedToggledClass')
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
                        prop                        = $rBlock.is('option') ? 'selected' : 'checked',
                        value                       = aRD.hasAttrContent($rBlock, blockName, ['data-ao-hide-block']) ? !state : state
                    ;
                    if( $rBlock.prop( prop ) !== value ){
                        if($rBlock.is('[type="radio"]')){
                            var $related            = $rBlock.closest('form, body').find( $radios ).filter('[name="' + $rBlock.attr('name') +'"]');
                            $checked                = $checked.add($related);
                            if( $related.length > 1 ){
                                var
                                    $hRel           = $related.filter(':ao-has-attr-content("' + blockName + '",data-ao-hide-block)'),
                                    $sRel           = $related.filter(':ao-has-attr-content("' + blockName + '",data-ao-show-block)')
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
        },
        __showBlock                                 = function($block, action, force, onComplete){
            if( !__checkShow($block, force) ){
                return $block;
            }
            _pingBlockEvent($block, 'aoBlockPreShow', [{'action' : action}]);
            $block.aoShow( false, function($el) {
                __toggleBlockRelatedStatus($el, true);
                _pingBlockEvent($el, 'aoBlockShow', [{'action' : action}]);
                aRD.apply(onComplete, $el);
                if( $el.is('[data-ao-animaze-shownresize]') ){
                    $el
                        .off('aoresize.aoShownActs')
                        .on({
                            'aoresize.aoShownActs'          : function(){
                                jQuery(this).aoAnimaze('shownresize');
                            },
                            'aoBlockPreHide.aoShownActs'    : function(){
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
        __hideBlock                                 = function($block, action, onComplete){
            if( !$block.is(':visible') ){
                return $block;
            }
            _pingBlockEvent($block, 'aoBlockPreHide', [{'action' : action}]);
            $block.data( 'aoShow__Checks', {} );
            $block.aoHide( false, function($el) {
                __toggleBlockRelatedStatus($el, false);
                _pingBlockEvent($el, 'aoBlockHide', [{'action' : action}]);
                aRD.apply(onComplete, $el);
                if( aRD.css.isAnimated ){
                    $el.filter('.' + aRD.css.isAnimated)
                        .add( $el.find('.' + aRD.css.isAnimated) )
                        .aoAnimazeFinish()
                    ;
                }
            });
            return $block;
        },
        __findBlock                                 = function(blockName){
            if( !blockName ){
                return jQuery([]);
            }
            var blocks                              = blockName.split(';');
            if( blocks.length > 1 ){
                //if more than 1 block - search for each
                var
                    $block,
                    $blocks                         = jQuery([])
                ;
                for (var i = 0; i < blocks.length; i++) {
                    $block                          = __findBlock(blocks[i]);
                    if( $block ){
                        $blocks                     = $blocks.add( $block );
                    }
                }
                return $blocks;
            }
            blockName                               = blockName.split(':')[0];
            return jQuery('[data-ao-block="' + blockName + '"]').eq(0);
        },
        __hideBlockCheck                            = function($block, action, isTemplate){
            __hideBlock($block, action, isTemplate ? function(){
                __removeBlock( this );
            } : null);
            return isTemplate ? false : $block;
        },
        __toggleBlock                               = function($el, options, state, action, force){
            var dfd                                 = jQuery.Deferred(),
                $block
            ;
            if( typeof(options) === 'string' ){
                var blocks                          = options.split(';');
                if( blocks.length > 1 ){
                    //if more than 1 block - run toggle for each block
                    var $blocks                     = jQuery([]),
                        count                       = 0,
                        _doneFn                     = function($_block){
                            $blocks                 = $blocks.add($_block);
                        },
                        _alwaysFn                   = function(){
                            ++count;
                            if( count === blocks.length ){
                                dfd.resolve($blocks);
                            }
                        }
                    ;
                    for (var i = 0; i < blocks.length; i++) {
                        __toggleBlock($el, blocks[i], state)
                            .done(_doneFn)
                            .always(_alwaysFn)
                        ;
                    }
                    return dfd;
                }
                options                             = options.split(':');
                options.blockName                   = options[0];
                options.templateName                = options.length > 1 ? options[1] : options[0];
            }
            if( options && options.blockName && __loadingBlocks[options.blockName] ){
                __loadingBlocks[options.blockName].always(function(){
                    __toggleBlock($el, options, state, action, force)
                        .done(function($_block){
                            dfd.resolve($_block);
                        })
                        .fail(function(){
                            dfd.reject();
                        })
                    ;
                });
                return dfd;
            }
            $block                                  = options && options.blockName ? jQuery('[data-ao-block="' + options.blockName + '"]').eq(0) : $el;
            state                                   = typeof(state) === 'boolean' ? state : !$block.is(':visible');

            if( state ){
                if( $block.length ){
                    dfd.resolve($block);
                }else if( options && options.templateName && !$block.length ){
                    dfd                             = __createFromTemplate($el, options.templateName, null, aRD.find($el, aRD.selectors.block, 'closest'));
                    __loadingBlocks[options.blockName] = dfd;
                    dfd
                        .done(function($_block){
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
                        .always(function(){
                            delete __loadingBlocks[options.blockName];
                        })
                    ;
                }else{
                    dfd.reject();
                }
                dfd
                    .done(function($_block){
                        if( $_block.is(':hidden') && $_block.data('aoToggleGroup') ){
                            jQuery('[data-ao-toggle-group="' + $_block.data('aoToggleGroup') + '"]:visible')
                                .not($_block)
                                .each(function(i, $hideBlock){
                                    $hideBlock          = jQuery($hideBlock);
                                    __hideBlockCheck($hideBlock, action, $hideBlock.is( aRD.selectors.template ));
                                })
                            ;
                        }
                        __showBlock($_block, action, force);
                    })
                ;
            }else if( $block.length ){
                dfd.resolve($block);
                __hideBlockCheck($block, action, $block.is( aRD.selectors.template ));
            }else{
                dfd.reject();
            }

            return dfd;
        },
        __triggerToggleBlock                        = function(el, opts, value, force){
            var
                $el                                 = jQuery(el),
                temp                                = typeof(value) === 'undefined' ? true : value,
                params                              = typeof(opts) === 'object' ? opts : aRD.getValueFromSettings(opts, {
                    type                            : 'datastring',
                    params                          : {
                        maxLength                       : 2,
                        list                            : [
                            'blockName',
                            'action'
                        ]
                    }
                })
            ;

            if( $el.is('[type="checkbox"], [type="radio"]') ){
                return __toggleBlock($el, params.blockName, temp ? $el.is(':checked') : !$el.is(':checked'), params.action, force);
            }else if( $el.is('option') ){
                return __toggleBlock($el, params.blockName, temp ? $el.is(':selected') : !$el.is(':selected'), params.action, force);
            }else{
                return __toggleBlock($el, params.blockName, value, params.action, force);
            }
        },
        _pingBlockEvent                             = function($el, eventName, params){
            var name                                = $el.trigger(eventName, params).data('aoBlock');
            if( name ){
                aRD.$doc.trigger(eventName + name, params);
            }
            aRD.$doc.trigger(eventName + '__gl', params);
        }
    ;

    aRD.css.template                                = 'ao-template-block';
    aRD.selectors.template                          = '.' + aRD.css.template;
    aRD.selectors.block                             = '.ao-block';
    aRD.selectors.addBlockClosest                   = aRD.selectors.block + ', ' + aRD.selectors.formGroup;
    aRD.selectors.removeBlockClosest                = '.ao-block, .' + aRD.css.template;
    aRD.findBlockGroup                              = __findBlockGroup;
    aRD.createFromTemplate                          = __createFromTemplate;
    aRD.createBlockTemplate                         = __createBlockTemplate;
    aRD.removeBlock                                 = __removeBlock;
    aRD.toggleBlockRelatedStatus                    = __toggleBlockRelatedStatus;
    aRD.showBlock                                   = __showBlock;
    aRD.hideBlock                                   = __hideBlock;
    aRD.findBlock                                   = __findBlock;
    aRD.toggleBlock                                 = __toggleBlock;
    aRD.triggerToggleBlock                          = __triggerToggleBlock;

    jQuery.fn.aoShowBlock                           = function(){
        jQuery(this).each(function(i, el){
            __triggerToggleBlock(el, false, true);
        });
        return this;
    };

    jQuery.fn.aoHideBlock                           = function(){
        jQuery(this).each(function(i, el){
            __triggerToggleBlock(el, false, false);
        });
        return this;
    };

    jQuery.fn.aoToggleBlock                         = function(){
        jQuery(this).each(function(i, el){
            __triggerToggleBlock(el);
        });
        return this;
    };

    jQuery.fn.aoLoadTemplate                        = function(template, options){
        jQuery(this).each(function(i, el){
            var $el                                 = jQuery(el);
            __createFromTemplate($el, template || $el.data('aoLoadTemplate'), options);
        });
        return this;
    };

    // Add init function
    aRD.pushFlist('init', function($container, findFn){
        $container[findFn]('[data-ao-load-template]').aoLoadTemplate();
        $container[findFn]('[data-ao-add-block]')
            .each(function(i, el){
                var $el                                     = jQuery(el);
                if( !aRD.hasDataString($el, 'aoAddBlock') ){
                    return;
                }
                var settings                                = aRD.getValueFromSettings($el.data('aoAddBlock'), __addBlockSettings);
                $el.data('aoAddBlock__cache', settings);
                if( settings.min && settings.group){
                    var
                        count                               = __findBlockGroup(settings.group).length,
                        $els                                = jQuery([]),
                        $toEl                               = settings.block ? __findBlock(settings.block) : aRD.find($el, aRD.selectors.addBlockClosest, 'closest'),
                        attrs                               = {
                            'data-ao-block-group'       : settings.group,
                            'data-ao-block-group-min'   : settings.min || null,
                            'data-ao-block-group-max'   : settings.max || null
                        }
                    ;
                    if( count < settings.min ){
                        for (var j = 0; j < settings.min; j++) {
                            $els                            = $els.add( __createFromTemplate($el, settings.template, null, $toEl, settings.position) );
                        }
                        $els.attr(attrs).aoInit();
                        $toEl.trigger('aoAddBlock');
                    }
                    count = $els = null;
                }
            })
            .off('.aoAddBlock')
            .on('aoChange.aoAddBlock.pBlockForced', {
                preventOnlyLink     : true
            }, function(){
                var $el                             = jQuery(this),
                    settings                        = $el.data('aoAddBlock__cache'),
                    $toEl                           = settings.block ? __findBlock(settings.block) : aRD.find($el, aRD.selectors.addBlockClosest, 'closest')
                ;
                //Don't add-block if no template found or it reached max number of copies
                if( settings.max && settings.group && __findBlockGroup(settings.group).length >= settings.max ){
                    return;
                }
                var $ins                            = __createFromTemplate($el, settings.template, null, $toEl, settings.position);
                if( settings.group ){
                    $ins.attr({
                        'data-ao-block-group'       : settings.group,
                        'data-ao-block-group-min'   : settings.min || null,
                        'data-ao-block-group-max'   : settings.max || null
                    });
                }
                $ins.aoInit();
                $toEl.trigger('aoAddBlock');
            })
        ;

        $container[findFn]('[data-ao-remove-block]').off('.pRemoveBlock').on('aoChange.pRemoveBlock.pBlockForced', {
                preventOnlyLink     : true
            }, function(){
                var
                    $el                                 = jQuery(this),
                    $toRemoveBlock                      = aRD.find($el, aRD.selectors.removeBlockClosest, 'closest')
                ;
                if( !$toRemoveBlock.length ){
                    return;
                }
                __removeBlock($toRemoveBlock);
            }
        );

        $container[findFn]('[data-ao-show-block]').off('.pShowBlock').on('aoChange.pShowBlock.pBlockForced', {
                preventOnlyLink     : true
            }, function(){
                __triggerToggleBlock(this, jQuery(this).data('aoShowBlock'), true);
            }
        );

        $container[findFn]('[data-ao-hide-block]').off('.pHideBlock').on('aoChange.pHideBlock.pBlockForced', {
                preventOnlyLink     : true
            }, function(){
                __triggerToggleBlock(this, jQuery(this).data('aoHideBlock'), false);
            }
        );
        $container[findFn]('[data-ao-toggle-block]').off('.pToggleBlock').on('aoChange.pToggleBlock.pBlockForced', {
                preventOnlyLink     : true
            }, function(){
                __triggerToggleBlock(this, jQuery(this).data('aoToggleBlock'));
            }
        );

        $container[findFn]('[data-ao-hide-toggle-group]').off('.pHideToggleGroup').on('aoChange.pHideToggleGroup.pBlockForced', {
                preventOnlyLink     : true
            }, function(){
                var
                    $el                                 = jQuery(this),
                    name                                = $el.data('aoHideToggleGroup')
                ;
                jQuery('[data-ao-toggle-group="' + name + '"]:visible')
                    .each(function(i, $hideBlock){
                        $hideBlock                      = jQuery($hideBlock);
                        __hideBlockCheck($hideBlock, false, $hideBlock.is( aRD.selectors.template ));
                    })
                ;
            }
        );

        $container[findFn]('[data-ao-action-block-action]').each(function(i, el){
            jQuery(el).triggerHandler('aoChange.pBlockForced');
        });
    });
})(aRunD);
