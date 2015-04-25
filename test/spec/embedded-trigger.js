var $ = require('jquery');

describe('embedded-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var embedded_trigger;

    beforeEach(function() {
        embedded_trigger = require('./scripts/embedded-trigger');
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
        embedded_trigger.trigger = null;
    });

    describe('.on', function() {
        var obj;
        var get_url;
        var get_url_with_args;
        var sendMessage;

        beforeEach(function() {
            body = $('<div id="body"></div>');
            obj = $('<embed id="obj" src="URL">').appendTo(body);
            get_url = sandbox.stub();
            get_url_with_args = get_url.withArgs(sinon.match(function(_obj) {
                return obj.is(_obj);
            }, 'is obj'));
            get_url_with_args.returns(obj.attr('src'));
            embedded_trigger.on(body, '#obj', get_url, sendMessage = sandbox.spy());
        });

        describe('trigger element', function() {
            it('should exist', function() {
                expect(body.find('.hovercards-embedded-trigger')).to.exist;
            });

            it('should be the only one', function() {
                embedded_trigger.on(body, '#somethingelse', $.noop);

                expect(body.find('.hovercards-embedded-trigger').length).to.equal(1);
            });

            it('should be hidden', function() {
                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });

            it('should be visible on mouseenter', function() {
                body.find('.hovercards-embedded-trigger').mouseenter();

                expect(body.find('.hovercards-embedded-trigger')).not.to.have.css('display', 'none');
            });

            it('should be hidden on mouseleave', function() {
                body.find('.hovercards-embedded-trigger').show();
                body.find('.hovercards-embedded-trigger').mouseleave();

                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });

            it('should send activate on click after obj mouseenter', function() {
                obj.mouseenter();
                body.find('.hovercards-embedded-trigger').click();

                expect(sendMessage).to.have.been.calledWith({ msg: 'activate', url: 'URL' });
            });
        });

        describe('on fullscreen', function() {
            it('should make the trigger element visible on fullscreen', function() {
                sandbox.stub(embedded_trigger, 'is_fullscreen').withArgs(sinon.match(function(_obj) {
                    return obj.is(_obj);
                }, 'is obj')).returns(true);
                obj.trigger($.Event('fullscreenchange'));

                expect(body.find('.hovercards-embedded-trigger')).not.to.have.css('display', 'none');
            });

            it('should put the trigger element at the top left', function() {
                obj.attr('src', null); // We don't want PhantomJS to get mad about the embed's URL when it gets attached to the document
                body.appendTo($('body')); // .offset won't mean anything unless the elements are attached to the document
                body.find('.hovercards-embedded-trigger').show(); // has to be visible to change its offset
                body.find('.hovercards-embedded-trigger').offset({ top: 20, left: 30 });
                body.find('.hovercards-embedded-trigger').hide();
                sandbox.stub(embedded_trigger, 'is_fullscreen').withArgs(sinon.match(function(_obj) {
                    return obj.is(_obj);
                }, 'is obj')).returns(true);
                obj.trigger($.Event('fullscreenchange'));

                expect(body.find('.hovercards-embedded-trigger').offset()).to.deep.equal(embedded_trigger.offset);
            });

            it('should make the trigger element hidden off fullscreen', function() {
                body.find('.hovercards-embedded-trigger').show();
                sandbox.stub(embedded_trigger, 'is_fullscreen').withArgs(sinon.match(function(_obj) {
                    return obj.is(_obj);
                }, 'is obj')).returns(false);
                obj.trigger($.Event('fullscreenchange'));

                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });
        });

        describe('on mouseenter', function() {
            it('should make the trigger element visible', function() {
                obj.mouseenter();

                expect(body.find('.hovercards-embedded-trigger')).not.to.have.css('display', 'none');
            });

            it('should not make the trigger element visible if get_url is null', function() {
                get_url_with_args.returns(null);
                obj.mouseenter();

                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });

            it('should move the trigger element\'s offset to match', function() {
                obj.attr('src', null); // We don't want PhantomJS to get mad about the embed's URL when it gets attached to the document
                body.appendTo($('body')); // .offset won't mean anything unless the elements are attached to the document

                obj.offset({ top: 20, left: 30 });
                obj.mouseenter();

                expect(body.find('.hovercards-embedded-trigger').offset()).to.deep.equal({ top:  20 + embedded_trigger.offset.top,
                                                                                           left: 30 + embedded_trigger.offset.left });
            });
        });

        describe('on mouseleave', function() {
            it('should make the trigger element hidden', function() {
                body.find('.hovercards-embedded-trigger').show();
                obj.mouseleave();

                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });
        });
    });
});
