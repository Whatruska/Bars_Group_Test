<h1>Bars group test app</h1>
<p>Internship test task</p>

<h2>How to use</h2>

<ol>
	<li>Clone or <a href="https://github.com/Whatruska/Bars_Group_Test">Download</a> <strong>Bars Group Test App</strong> from GitHub</li>
	<li>Install Node Modules: <strong>npm i</strong></li>
	<li>Run: <strong>gulp</strong></li>
</ol>

<pre>
git clone https://github.com/Whatruska/Bars_Group_Test.git
npm i
gulp
</pre>

<h2>Main Gulp tasks:</h2>

<ul>
	<li><strong title="gulp task"><em>gulp</em></strong>: run default gulp task (images, styles, scripts, browsersync, startwatch)</li>
	<li><strong title="cleanimg task"><em>cleanimg</em></strong>: Clean all compressed images</li>
	<li><strong title="styles, scripts, images, assets tasks"><em>styles, scripts, images, assets</em></strong>: build assets (css, js, images or all)</li>
	<li><strong title="rsync task"><em>rsync</em></strong>: project deployment via <strong>RSYNC</strong></li>
</ul>

<h2>Basic rules</h2>

<ol>
	<li>All custom <strong title="scripts task"><em>scripts</em></strong> located in <strong>app/js/app.js</strong></li>
	<li>All custom <strong title="styles task"><em>styles</em></strong> located in <strong>app/sacc/main.sass</strong></li>
	<li>All preprocessor <strong>configs</strong> placed in <strong>app/sass/_config.sass</strong></li>
	<li>All <strong>images</strong> sources placed in <strong>app/images/src/</strong> folder.</li>
</ol>

Based on <strong><a href="https://github.com/agragregra/oh5">OptimizedHTML-5<a/><strong/>

