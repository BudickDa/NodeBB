
<div class="well">

	<div class="account-username-box" data-userslug="{userslug}">
		<span class="account-username">
			<a href="/user/{userslug}">{username}</a> <i class="fa fa-chevron-right"></i>
			<a href="/user/{userslug}/settings">[[user:settings]]</a>
		</span>
	</div>

	<div class="row">
		<div class="col-md-6">
			<h4>privacy</h4>
			<div class="checkbox">
				<label>
	      			<input id="showemailCheckBox" type="checkbox" {showemail}> [[user:show_my_email]]
	    		</label>
	    	</div>
		</div>

		<div class="col-md-6">

		</div>
	</div>
	<div class="form-actions">
		<a id="submitBtn" href="#" class="btn btn-primary">[[global:save_changes]]</a>
	</div>
</div>
