module.exports = function (eleventyConfig) {
  // Префикс пути для превью в подпапке (напр. /prosite-preview/).
  // Включается через переменную окружения PATH_PREFIX на сборке превью;
  // без неё локальная разработка и прод на своём домене не меняются.
  const PATH_PREFIX = (process.env.PATH_PREFIX || "").replace(/\/$/, "");
  if (PATH_PREFIX) {
    eleventyConfig.addTransform("pathprefix", function (content) {
      const out = this.page && this.page.outputPath;
      if (!out || !out.endsWith(".html")) return content;
      // корне-относительные href/src ("/...") → с префиксом; "//..." и data:/http не трогаем
      return content.replace(/(href|src)="\/(?!\/)/g, `$1="${PATH_PREFIX}/`);
    });
  }

  // Статику копируем как есть
  eleventyConfig.addPassthroughCopy({ "src/styles": "styles" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Год для подвала
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  return {
    dir: {
      input: "src",
      output: "docs",
      includes: "_includes",
      data: "_data"
    },
    // .njk и .md обрабатываются шаблонизатором Nunjucks
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
