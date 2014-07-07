<div v-component="br-articleList">
	<div v-repeat="articles">
		<h1>{{title}}</h1>
		<p>{{preview}}</p>
		<a href="{{file}}">Read more...</a>
	</div>
</div>