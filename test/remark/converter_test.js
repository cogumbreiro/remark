var converter = require('../../src/remark/converter');

describe('Converter', function () {
  it('should convert empty content', function () {
    var content = [''];
    converter.convertMarkdown(content).should.equal('');
  });

  it('should convert paragraph', function () {
    var content = ['paragraph'];
    converter.convertMarkdown(content).should.equal('<p>paragraph</p>');
  });

  it('should convert paragraph with inline content class', function () {
    var content = [
      'before ',
      { block: false, class: 'whatever', content: ['some _fancy_ content'] },
      ' after'
    ];
    converter.convertMarkdown(content).should.equal(
      '<p>before <span class="whatever">some <em>fancy</em> content</span> after</p>');
  });

  it('should convert reference-style link', function () {
    var content = ['[link][id]'],
        links = { id: { href: 'url', title: 'title'} };

    converter.convertMarkdown(content, links).should.equal(
      '<p><a href="url" title="title">link</a></p>');
  });

  it('should leave LaTeX alone', function () {
    var content = ['$`a_1 b_{2}`$'];

    converter.convertMarkdown(content).should.equal(
      '<p>$a_1 b_{2}$</p>');
  });

  it('should leave LaTeX alone (display)', function () {
    var content = ['```math\na_1 b_{2}\n```'];

    converter.convertMarkdown(content).should.equal(
      '$$a_1 b_{2}\n$$');
  });

});
