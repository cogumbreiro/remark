var showdown = require('showdown')
  , converter = module.exports = {}
  , element = document.createElement('div')
  ;

showdown.extension('tex', function() {
  function htmlunencode(text) {
    return (
      text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
      );
  }
  return [
    {
      type: 'output',
      filter: function (text, converter, options) {
        // use new shodown's regexp engine to conditionally parse codeblocks
        var left  = '<pre><code class="math language-math">',
            right = '</code></pre>',
            flags = 'g',
            replacement = function (wholeMatch, match, left, right) {
              // unescape match to prevent double escaping
              match = htmlunencode(match);
              return "$$" + match + "$$";
            };
        return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
      }
    }
  ];
});

var sdConverter = new showdown.Converter({
  ghCompatibleHeaderId: true,
  ghCodeBlocks: true,
  tables: true,
  tasklists: true,
  simpleLineBreaks: false,
  extensions: ['tex']
});

converter.convertMarkdown = function (content, links, inline) {
  element.innerHTML = convertMarkdown(content, links || {}, inline);
  element.innerHTML = element.innerHTML.replace(/<p>\s*<\/p>/g, '');
  return element.innerHTML.replace(/\n\r?$/, '');
};

function md2txt(text, links) {
  var keys = Object.keys(links);
  for (var i = 0; i < keys.length; ++i) {
    var linkId = keys[i];
    var entry = links[linkId];
    text += '\n[' + linkId + ']: ' + entry.href + ' "' + entry.title + '"\n';
  }
  
  return sdConverter
      .makeHtml(text)
      .replace('$<code>', '$')
      .replace('</code>$', '$');
}

function convertMarkdown (content, links, insideContentClass) {
  var i, tag, markdown = '', html;

  for (i = 0; i < content.length; ++i) {
    if (typeof content[i] === 'string') {
      markdown += content[i];
    }
    else {
      tag = content[i].block ? 'div' : 'span';
      markdown += '<' + tag + ' class="' + content[i].class + '">';
      markdown += convertMarkdown(content[i].content, links, !content[i].block);
      markdown += '</' + tag + '>';
    }
  }

  html = md2txt(markdown.replace(/^\s+/, ''), links);

  if (insideContentClass) {
    element.innerHTML = html;
    if (element.children.length === 1 && element.children[0].tagName === 'P') {
      html = element.children[0].innerHTML;
    }
  }

  return html;
}
