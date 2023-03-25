var canvas;
var GCODE_DATA = "";
var font = "";
var background_image;
var background_image_set = false;
var imageLoader = document.getElementById('imageLoader');
var curAngle = 0;
imageLoader.addEventListener('change', handleImage, false);
$(function(){
	init_url();
	init_canvas();
	init_fonts();
	new_text_block("Welcome to 3D Writer !", "cursive", 1, 0 , 0, 0);
	update_bed_size();
	render_preview();
	init_font_selection();
	$("#harware_setup table td input[type=text]").on("change", function(){
		setting_update( $(this) );
	});
	update_url();
});
function init_url(){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if(urlParams=='')return;
	var data = JSON.parse( (decodeURI(queryString)).replace("?c=", "") );
	$("#set_bed_x").val( data.set_bed_x );
	$("#set_bed_y").val( data.set_bed_y );
	$("#set_pen_offset_x").val( data.set_pen_offset_x );
	$("#set_pen_offset_y").val( data.set_pen_offset_y );
	$("#set_pen_up").val( data.set_pen_up );
	$("#set_pen_down").val( data.set_pen_down );
	$("#set_travel_speed").val( data.set_travel_speed );
	$("#set_draw_speed").val( data.set_draw_speed );
	$("#set_home_x").prop( "checked", data.set_home_x==1 );
	$("#set_home_y").prop( "checked", data.set_home_y==1 );
	$("#set_home_z").prop( "checked", data.set_home_z==1 );
	$("#set_dry_run").prop( "checked", data.set_dry_run==1 );
	$("#set_manual_positioning").prop("checked", data.set_manual_positioning==1 );
	$("#set_manual_positioning_z").prop("checked", data.set_manual_positioning_z==1 );
	if(data.set_manual_positioning)
		$("#manual_positioning_z").addClass("show");
}
function update_url(){
	var fstate = {
		set_bed_x: $("#set_bed_x").val(),
		set_bed_y: $("#set_bed_y").val(),
		set_pen_offset_x: $("#set_pen_offset_x").val(),
		set_pen_offset_y: $("#set_pen_offset_y").val(),
		set_pen_up: $("#set_pen_up").val(),
		set_pen_down: $("#set_pen_down").val(),
		set_travel_speed: $("#set_travel_speed").val(),
		set_draw_speed: $("#set_draw_speed").val(),
		set_home_x: $("#set_home_x").prop("checked")?1:0,
		set_home_y: $("#set_home_y").prop("checked")?1:0,
		set_home_z: $("#set_home_z").prop("checked")?1:0,
		set_dry_run: $("#set_dry_run").prop("checked")?1:0,
		set_manual_positioning: $("#set_manual_positioning").prop("checked")?1:0,
		set_manual_positioning_z: $("#set_manual_positioning_z").prop("checked")?1:0,
	};
	var fstate = JSON.stringify(fstate); 
	window.history.pushState('page2', '3DWriter', '?c='+fstate);
}

function init_fonts(){
	font = jQuery.parseJSON(hershey);
}
function init_canvas(){
	canvas = document.getElementById('preview_canvas');
	canvas.width  = 800;
	canvas.height = 600;
}
function setting_update(obj){
	var val = $(obj).val();
	var id = $(obj).prop("id");
	if(id=='set_bed_x' || id=='set_bed_y' || id=='set_preview_scale')	update_bed_size();
	render_preview();
	update_url();
}
function new_text_block(text = "New text", font_name = "cursive", x = null, y = null, letspace = 0, linspace = 0, size = 12){
	if(x==null){
		x = 1;
	}
	if(y==null){
		y = parseFloat($(".text_block .txt_y").last().val())+20;
	}
	$("#tb_stash .text_block").clone().appendTo(".text_blocks");
	var tb = $(".text_block").last();
	$(tb).find(".txt_x").val(x);
	$(tb).find(".txt_y").val(y);
	$(tb).find(".txt_txt").val(text);
	$(tb).find(".font-size").find(".content").html(size+"mm");
	$(tb).find(".font-size").find(".content").data("val", size);
	$(tb).find(".letter_Spacing").find(".content").html(letspace);
	$(tb).find(".letter_Spacing").find(".content").data("val", letspace);
	$(tb).find(".line_spacing").find(".content").html(linspace);
	$(tb).find(".line_spacing").find(".content").data("val", linspace);
	render_preview();
}
function text_block_remove(obj){
	$(obj).parent().remove();
	render_preview();
}
function update_bed_size(){
	var mag = $("#set_preview_scale").val();
	var x = $("#set_bed_x").val() * mag;
	var y = $("#set_bed_y").val() * mag;
	$("#preview_canvas").css({ width:x, height:y});
	canvas.width  = x;
	canvas.height = y;
}
function set_adv(opt){
	if(opt){
		$(".adv_ctrl").css("display","inline-block");
	}else{
		$(".adv_ctrl").css("display","none");
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FILE FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function project_open(){
	$("#project_upload_input").trigger("click");
}
function handle_upload(file){
	readFileIntoMemory(file[0], function(fileInfo) {
		console.info("Read file " + fileInfo.name + " of size " + fileInfo.size);
		var project = jQuery.parseJSON(fileInfo.content);
		console.log(project);
		$("#set_preview_scale").val(project.screen_scale);
		$("#set_bed_x").val(project.bed_x);
		$("#set_bed_y").val(project.bed_y);
		$("#set_pen_offset_x").val(project.x_pen_offset);
		$("#set_pen_offset_y").val(project.y_pen_offset);
		$("#set_home_x").prop("checked",project.set_home_x);
		$("#set_home_y").prop("checked",project.set_home_y);
		$("#set_home_z").prop("checked",project.set_home_z);
		$("#set_dry_run").prop("checked",project.set_dry_run);
		$("#set_manual_positioning").prop("checked", project.set_manual_positioning );
		$("#set_manual_positioning_z").prop("checked", project.set_manual_positioning_z );
		$("#set_pen_up").val(project.penup);
		$("#set_pen_down").val(project.pendown);
		$("#set_travel_speed").val(project.travel_speed);
		$("#set_draw_speed").val(project.draw_speed);
		$(".text_blocks .text_block").remove();
		for(var tb in project.textblocks){
			new_text_block(project.textblocks[tb].words , project.textblocks[tb].font_name, project.textblocks[tb].position_x, project.textblocks[tb].position_y , project.textblocks[tb].letter_spacing, project.textblocks[tb].line_spacing, project.textblocks[tb].height_mm);
		}
		if(project.set_manual_positioning)
			$("#manual_positioning_z").addClass("show");
	});
}
function readFileIntoMemory (file, callback) {
	var reader = new FileReader();
	reader.onload = function () {
		callback({
			name: file.name,
			size: file.size,
			type: file.type,
			content: this.result
		 });
	};
	reader.readAsText(file);
}
function project_save(){
	var screen_scale = $("#set_preview_scale").val();
	var bed_x = $("#set_bed_x").val();
	var bed_y = $("#set_bed_y").val();
	var x_pen_offset = $("#set_pen_offset_x").val();
	var y_pen_offset = $("#set_pen_offset_y").val();
	var g_set_home_x = $("#set_home_x").prop("checked");
	var g_set_home_y = $("#set_home_y").prop("checked");
	var g_set_home_z = $("#set_home_z").prop("checked");
	var g_set_dry_run = $("#set_dry_run").prop("checked");
	var g_set_manual_positioning = $("#set_manual_positioning").prop("checked");
	var g_set_manual_positioning_z = $("#set_manual_positioning_z").prop("checked");
	var g_penup = $("#set_pen_up").val();
	var g_pendown = $("#set_pen_down").val();
	var g_travel_speed = $("#set_travel_speed").val();
	var g_draw_speed = $("#set_draw_speed").val();
	var output_blocks = [];
	$(".text_blocks .text_block").each(function() {
		var words = $(this).find(".txt_txt_div").find(".txt_txt").val();
		var height_mm = $(this).find(".font-size").find(".content").data("val");
		var letter_spacing = parseFloat($(this).find(".letter_Spacing").find(".content").data("val"));
		var line_spacing = parseFloat($(this).find(".line_spacing").find(".content").data("val"));
		var font_name = $(this).find(".font_selection").find(".content").data("val");
		var position_x = parseFloat($(this).find(".txt_x_div").find(".txt_x").val());
		var position_y = parseFloat($(this).find(".txt_y_div").find(".txt_y").val());
		output_blocks.push({
			words: words,
			height_mm: height_mm,
			letter_spacing: letter_spacing,
			line_spacing: line_spacing,
			font_name: font_name,
			position_x: position_x,
			position_y: position_y
		});
	});
	var output = {
		screen_scale:screen_scale, 
		bed_x: bed_x, 
		bed_y: bed_y, 
		x_pen_offset: x_pen_offset, 
		y_pen_offset: y_pen_offset, 
		set_home_x: g_set_home_x, 
		set_home_y: g_set_home_y,
		set_home_z: g_set_home_z,
		set_dry_run: g_set_dry_run,
		set_manual_positioning: g_set_manual_positioning,
		set_manual_positioning_z: g_set_manual_positioning_z,
		penup: g_penup,
		pendown: g_pendown,
		travel_speed: g_travel_speed,
		draw_speed: g_draw_speed,
		textblocks: output_blocks
		};
	console.log(output);
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( JSON.stringify(output) ));
	element.setAttribute('download', 'project.3dw');
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
function load_background(){
	$("#imageLoader").trigger("click");
}
function handleImage(e){
	var reader = new FileReader();
	
	reader.onload = function(event){
		var img = new Image();
		img.onload = function(){
			background_image = img;
			background_image_set = true;
			render_preview();
		}
		img.src = event.target.result;
	}
	reader.readAsDataURL(e.target.files[0]);     
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TEXT BLOCK FUNCTIONS - START ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var option_font_obj;
var option_size_obj;
var option_letspac_obj;
var option_linspac_obj;
var option_linang_obj;
function tb_conf(obj, verb){
	var pos = $( obj ).offset();
	if(verb=='font'){
		option_font_obj = obj;
		var this_val = $(obj).find(".content").data("val");
		$(".option_font").css({top:pos.top, left:pos.left}).show();
	}
	if(verb=='size'){
		option_size_obj = obj;
		var this_val = $(obj).find(".content").data("val");
		$(".option_size").css({top:pos.top, left:pos.left}).show();
		$(".option_size #tb_id").val();
		$(".option_size_opt").css("font-weight","normal");
		$(".opt_"+this_val).css("font-weight","bold");
	}
	if(verb=='left'){
		$(obj).parent().find(".txt_x_div").find(".txt_x").val(0);
		render_preview();
	}
	if(verb=='center'){
		var this_width = $(obj).parent().find("#txt_block_width").val();
		var bed_x = parseInt($("#set_bed_x").val());
		$(obj).parent().find(".txt_x_div").find(".txt_x").val( (bed_x/2) - (this_width/2) );
		render_preview();
	}
	if(verb=='right'){
		var this_width = $(obj).parent().find("#txt_block_width").val();
		var x_pen_offset = parseFloat($("#set_pen_offset_x").val());
		var bed_x = parseInt($("#set_bed_x").val());
		$(obj).parent().find(".txt_x_div").find(".txt_x").val( bed_x - this_width - x_pen_offset -2 );
		render_preview();
	}
	if(verb=='letspac'){
		option_letspac_obj = obj;
		$(".option_letspac").css({top:pos.top, left:pos.left}).show().find(".option_letspac_txt").focus().select();
	}
	if(verb=='linspac'){
		option_linspac_obj = obj;
		$(".option_linspac").css({top:pos.top, left:pos.left}).show().find(".option_linspac_txt").focus().select();
	}
	if(verb=='linang'){
		option_linang_obj = obj;
		$(".option_linang").css({top:pos.top, left:pos.left}).show().find(".option_linang_txt").focus().select();
	}
}
function tb_conf_key(e, obj){
	if(e.key=='Enter'){
		$(obj).next().trigger("click");
	}
}
function tb_conf_click(obj, verb, val){
	if(verb=='font'){
		$(".option_font").hide();
		$(option_font_obj).find(".content").html(val);
		$(option_font_obj).find(".content").data("val", val);
		render_preview();
	}
	if(verb=='size'){
		$(".option_size").hide();
		$(option_size_obj).find(".content").html(val+" mm");
		$(option_size_obj).find(".content").data("val", val);
		render_preview();
	}
	if(verb=='letspac'){
		$(".option_letspac").hide();
		var this_val = $(obj).prev().val();
		$(option_letspac_obj).find(".content").html(this_val);
		$(option_letspac_obj).find(".content").data("val", this_val);
		render_preview();
	}
	if(verb=='linspac'){
		$(".option_linspac").hide();
		var this_val = $(obj).prev().val();
		$(option_linspac_obj).find(".content").html(this_val);
		$(option_linspac_obj).find(".content").data("val", this_val);
		render_preview();
	}
	if(verb=='linang'){
		$(".option_linang").hide();
		var this_val = $(obj).prev().val();
		if(this_val>10)	this_val=10;
		if(this_val<-10)	this_val=-10;
		$(option_linang_obj).find(".content").html(this_val);
		$(option_linang_obj).find(".content").data("val", this_val);
		render_preview();
	}
}
function init_font_selection(){
	var first = ['cursive', 'futural', 'scripts', 'timesi', 'timesr'];
	$(".option_font .font_menu").append('<span class="font_menu_title">Simple fonts</span>');
	for(var key in first){
		var font_height = parseFloat(font[first[key]][2]);
		$(".option_font .font_menu").append( '<div class="hf_div" style="height:'+(font_height+8)+'px;" onclick="tb_conf_click(this,\'font\',\''+first[key]+'\');"><label>'+first[key]+'</label><canvas class="font_sel_canvas" id="canvas_'+first[key]+'"></canvas></div>' );
		render_example( first[key] );
	}
	$(".option_font .font_menu").append('<span class="font_menu_title">Complex fonts</span>');
	for(var key in font){
		if( !(key=='cursive' || key=='futural' || key=='scripts' || key=='timesi' || key=='timesr') ){
			var font_height = parseFloat(font[key][2]);
			$(".option_font .font_menu").append( '<div class="hf_div" style="height:'+(font_height+8)+'px;" onclick="tb_conf_click(this,\'font\',\''+key+'\');"><label>'+key+'</label><canvas class="font_sel_canvas" id="canvas_'+key+'"></canvas></div>' );
			render_example( key );
		}
	}
}
function render_example(fname){
	var words = "The quick brown fox jumps over the lazy dog";
	var obj = document.getElementById("canvas_"+fname);
	var fonts_real_height = parseFloat(font[fname][2]);
	obj.width  = 800;
	obj.height = fonts_real_height+5;
	var ctex = obj.getContext("2d");
	ctex.clearRect(0, 0, obj.width, obj.height);
	ctex.fillStyle = "#FFFFFF";
	ctex.fillRect(0, 0, obj.width, obj.height);
	ctex.lineWidth = 0.5;
	var fwidth = 0;
	var x=1;
	var y=1;
	var print_scale_factor=1;
	for(pos=0; pos<words.length; pos++){
		var this_character = words.substr(pos, 1);
		var font_character = fetch_character(fname, this_character);
		var coords = font_character[1].split(",");
		var real_width = parseFloat(coords[0]);
		for(i=2; i<(coords.length-2); i=i+4){
			var x1 = ((parseFloat(coords[i+0])*print_scale_factor)+x)*1;
			var y1 = ((parseFloat(coords[i+1])*print_scale_factor)+y)*1;
			var x2 = ((parseFloat(coords[i+2])*print_scale_factor)+x)*1;
			var y2 = ((parseFloat(coords[i+3])*print_scale_factor)+y)*1;
			ctex.beginPath();
			ctex.moveTo( parseInt(x1), parseInt(y1));
			ctex.lineTo(parseInt(x2), parseInt(y2));
			ctex.stroke();
		}
		x+=real_width;
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RENDER FUNCTIONS - START ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function out_of_bounds(){
	$("#oob_text").show();
}
function no_z_homing(){
	$("#no_z_homing").show();
}
function fetch_character(fontname, symbol){
	var characters = font[fontname][0];

	for(cpos=0; cpos < characters.length; cpos++){
		if(characters.substr(cpos,1)==symbol){
			return font[fontname][1][cpos];
		}
	}
	return false;
}
function write_character(obj, x, y, height, print_scale_factor, screen_scale_factor, angle = 0, width = 16){
	var ctx = canvas.getContext("2d");
	ctx.lineWidth = 1;
	ctx.translate(0.5, 0.5);
	var coords = obj;
	height = parseFloat(height);
	var bed_x = parseInt($("#set_bed_x").val());
	var bed_y = parseInt($("#set_bed_y").val());
	for(i=2; i<(obj.length-2); i=i+4){
		obj[i+0] = parseFloat( obj[i+0] );
		obj[i+1] = parseFloat( obj[i+1] );
		obj[i+2] = parseFloat( obj[i+2] );
		obj[i+3] = parseFloat( obj[i+3] );
		var x1 = (obj[i+0] * print_scale_factor) + x;
		var y1 = (obj[i+1] * print_scale_factor) + y;
		var x2 = (obj[i+2] * print_scale_factor) + x;
		var y2 = (obj[i+3] * print_scale_factor) + y;
		var rotext_start = rotate(x*print_scale_factor, y*print_scale_factor, x1, y1, 0-angle);	//BUG:5/06/2019: my origin is not correct. 
		var rotext_end =   rotate(x*print_scale_factor, y*print_scale_factor, x2, y2, 0-angle);	//BUG:5/06/2019: my origin is not correct. 
		x1 = rotext_start[0] * screen_scale_factor;
		y1 = rotext_start[1] * screen_scale_factor;
		x2 = rotext_end[0] * screen_scale_factor;
		y2 = rotext_end[1] * screen_scale_factor;
		ctx.beginPath();
		ctx.moveTo( parseInt(x1), parseInt(y1));
		ctx.lineTo( parseInt(x2), parseInt(y2));
		ctx.stroke();

		var gc_x1 = (obj[i+0] * print_scale_factor)+x;
		var gc_y1 = (bed_y - y)-(obj[i+1] * print_scale_factor);
		var gc_x2 = (obj[i+2] * print_scale_factor)+x;
		var gc_y2 = (bed_y-y)-(obj[i+3] * print_scale_factor);
		rotext_start = rotate(height * screen_scale_factor, bed_y, gc_x1, gc_y1, angle);	//BUG:5/06/2019: my origin is not correct. 
		rotext_end = rotate(height * screen_scale_factor, bed_y, gc_x2, gc_y2, angle);	//BUG:5/06/2019: myorigin is not correct. 
		gc_x1 = rotext_start[0];
		gc_y1 = rotext_start[1];
		gc_x2 = rotext_end[0];
		gc_y2 = rotext_end[1];

		if( gc_x1>bed_x || gc_x1<0 ||   gc_y1>bed_y || gc_y1<0 ||   gc_x2>bed_x || gc_x2<0 ||   gc_y2>bed_y || gc_y2<0 ){	//test if pen went out of bounds
			out_of_bounds();
		}
		GCODE_DATA.push( [ gc_x1, gc_y1, gc_x2, gc_y2 ]);
	}
	ctx.translate(-0.5, -0.5);
}
function line(ctx, x1, y1, x2, y2){
	ctx.beginPath();
	ctx.moveTo( x1, y1 );
	ctx.lineTo( x2, y2 );
	ctx.stroke();
}
function rotate(cx, cy, x, y, angle) {
	//Credit: https://stackoverflow.com/a/17411276
	var radians = (Math.PI / 180) * angle,
	cos = Math.cos(radians),
	sin = Math.sin(radians),
	nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
	ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
	return [nx, ny];
}
function set_no_z_homing_warning(){
	let shouldWarn = $("#set_manual_positioning_z").prop("checked") && !$("#set_home_z").prop("checked");
	if(shouldWarn)
		$("#no_z_homing").show();
	else
		$("#no_z_homing").hide();
}

function render_preview(){
	$("#oob_text").hide();
	set_no_z_homing_warning();
	$(".tb_border").remove();
	update_url();
	var screen_scale = parseInt($("#set_preview_scale").val());
	var x_pen_offset = parseFloat($("#set_pen_offset_x").val());
	var y_pen_offset = parseFloat($("#set_pen_offset_y").val());
	var bed_x = parseInt($("#set_bed_x").val());
	var bed_y = parseInt($("#set_bed_y").val());
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 0.2;
	ctx.translate(0.5, 0.5);
	ctx.strokeStyle = "#7da5c8";
	if(background_image_set){
		var sx = background_image.width * screen_scale;
		var sy = background_image.height * screen_scale;
		ctx.drawImage(background_image,0,0, sx, sy);
	}

	for(xy=1; xy<=canvas.width; xy=xy+(10*parseFloat(screen_scale))){
		ctx.beginPath();
		ctx.moveTo( 0, xy);
		ctx.lineTo( canvas.width, xy);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo( xy , 0);
		ctx.lineTo( xy, canvas.height);
		ctx.stroke();
	}
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#b0ceff";
	line(ctx, 0, 0, bed_x*screen_scale, 0);
	line(ctx, 0, bed_y*screen_scale-1, bed_x*screen_scale, bed_y*screen_scale-1);
	line(ctx, 0, 0, 0, bed_y*screen_scale);
	line(ctx, (bed_x*screen_scale)-1, 0, (bed_x*screen_scale)-1, (bed_y*screen_scale));
	ctx.strokeStyle = "#ffcc66";
	ctx.beginPath();
	if(y_pen_offset>0){
		ctx.moveTo( 0, y_pen_offset*screen_scale);
		ctx.lineTo( canvas.width, y_pen_offset*screen_scale);
	}else{
		ctx.moveTo( 0, (bed_y+y_pen_offset)*screen_scale);
		ctx.lineTo( canvas.width, (bed_y+y_pen_offset)*screen_scale);
	}
	ctx.stroke();
	ctx.beginPath();
	if(x_pen_offset>0){
		ctx.moveTo( x_pen_offset*screen_scale, 0);
		ctx.lineTo( x_pen_offset*screen_scale, canvas.height);
	}else{
		ctx.moveTo( (bed_x+x_pen_offset)*screen_scale, 0);
		ctx.lineTo( (bed_x+x_pen_offset)*screen_scale, canvas.height);
	}
	ctx.stroke();
	ctx.strokeStyle = "#000000";
	ctx.translate(-0.5, -0.5);
	ctx.lineWidth = 1;
	GCODE_DATA = [];
	var real_width = 0;
	var block_count = 0;
	var invalid_chars_count = 0;
	var invalid_chars = "";
	$(".text_blocks .text_block").each(function() {
		var words = $(this).find(".txt_txt_div").find(".txt_txt").val();
		var height_mm = $(this).find(".font-size").find(".content").data("val");
		var letter_spacing = parseFloat($(this).find(".letter_Spacing").find(".content").data("val"));
		var line_spacing = parseFloat($(this).find(".line_spacing").find(".content").data("val"));
		var line_angle = parseFloat($(this).find(".line_angle").find(".content").data("val"));
		var font_name = $(this).find(".font_selection").find(".content").data("val");
		var position_x = parseFloat($(this).find(".txt_x_div").find(".txt_x").val());
		var position_y = parseFloat($(this).find(".txt_y_div").find(".txt_y").val());
		var x = x_pen_offset+position_x;
		var y = y_pen_offset+position_y;
		var original_x = x;
		var original_y = y;
		var block_width = 0;
		var block_height = 0;
		var height = (height_mm);
		var real_height = 0;
		var fonts_real_height = font[font_name][2];
		var fwidth = 0;
		for(pos=0; pos<words.length; pos++){
			var this_character = words.substr(pos, 1);
			if(this_character==" "){
				var font_character = fetch_character(font_name, this_character);
				var left_right_width = font_character[0].split("/");
				var font_strokes = font_character[1].split(",");
				real_width = parseFloat(font_strokes[0]);
				var scaled_width = real_width * scale_factor;
				x+=scaled_width;
			}else if(this_character=="\n"){
				y+=parseFloat(height)+line_spacing;
				x=original_x;
			}else{
				var font_character = fetch_character(font_name, this_character);
				if(font_character===false){
					invalid_chars_count++;
					invalid_chars=invalid_chars+this_character;
				}else{
					var left_right_width = font_character[0].split("/");
					var font_strokes = font_character[1].split(",");
					real_width = parseFloat(font_strokes[0]);
					real_height = parseFloat(font_strokes[1]);
					var scale_factor = (parseFloat(height_mm) / (parseFloat(fonts_real_height)/100))/100;
					var scaled_width = real_width * scale_factor;
					var scaled_height = real_height * scale_factor;
					var out_x = x;
					var out_y = y;
					write_character(font_strokes, out_x, out_y, scaled_height, scale_factor, screen_scale , 0-line_angle, real_width);
					x+= scaled_width+letter_spacing;
				}
			}
			if(x>block_width)	block_width = x;
			if(y>block_height)	block_height = (y);
		}
		block_width = (block_width - original_x);
		block_height = (block_height - original_y) + parseFloat(height);
		$(this).find("#txt_block_width").val(block_width);
		$(this).find("#txt_block_height").val(block_height);
		$(".canvas_div").append('<div class="tb_border dib" data-blockid="'+block_count+'" style="transform: rotate('+(0-line_angle)+'deg);transform-origin: bottom left;cursor:move;position:absolute; border:1px solid #d4d4d4;left:'+((original_x*screen_scale)+19)+'px; top:'+(original_y*screen_scale)+'px; width:'+((block_width*screen_scale)+5)+'px; height:'+(block_height*screen_scale)+'px;"></div');
		$('.tb_border').draggable({
			start: function( event, ui ) {
				curAngle = getRotationDegrees($(this));
				$(this).css({ 'transform': 'rotate(0deg)'}).addClass("light_borders");	//BUG:5/06/2019: transform reset gives incorrect X/Y Position (off by rotated width/height)
			},
			stop: function( event, ui ) {
				$(this).removeClass("light_borders");
				update_drag(this);
				}
			});
		block_count++;
	});
	if(invalid_chars_count>0){
		alert("Some invalid characters ["+invalid_chars+"] where not rendered, Check your text.");
	}
}
function getRotationDegrees(obj) {
	//Credit: https://stackoverflow.com/a/38393481
	var matrix = obj.css("-webkit-transform") ||
	obj.css("-moz-transform")    ||
	obj.css("-ms-transform")     ||
	obj.css("-o-transform")      ||
	obj.css("transform");
	if(matrix !== 'none') {
		var tr;
		if (tr = matrix.match('matrix\\((.*)\\)')) {
			tr = tr[1].split(',');
			if(typeof tr[0] != 'undefined' && typeof tr[1] != 'undefined') {
				var angle = Math.round(Math.atan2(tr[1], tr[0]) * (180/Math.PI));
			}else{
				var angle = 0; 
			}
		}else if(tr = matrix.match('rotate\\((.*)deg\\)')){
			var angle = parseInt(tr[1]); 
		}
	} else { var angle = 0; }
	return (angle < 0) ? angle + 360 : angle;
}
function update_drag(obj){
	var pos = $(obj).position();
	$(obj).css({ 'transform': 'rotate(' + curAngle + 'deg)'});
	var id = $(obj).data("blockid");
	var screen_scale = parseInt($("#set_preview_scale").val());
	var x_pen_offset = parseFloat($("#set_pen_offset_x").val());
	var y_pen_offset = parseFloat($("#set_pen_offset_y").val());
	if(pos.top>0 && pos.left>0){
		$(".text_blocks .text_block:eq("+id+")").find(".txt_x_div").find(".txt_x").val((pos.left-x_pen_offset-20)/screen_scale);
		$(".text_blocks .text_block:eq("+id+")").find(".txt_y_div").find(".txt_y").val((pos.top-(y_pen_offset*screen_scale))/screen_scale);
	}
	render_preview();
}
function render_gcode(){
	render_preview();
	var gcode_output = "";
	var g_set_home_x = $("#set_home_x").prop("checked");
	var g_set_home_y = $("#set_home_y").prop("checked");
	var g_set_home_z = $("#set_home_z").prop("checked");
	var g_set_dry_run = $("#set_dry_run").prop("checked");
	var g_set_manual_positioning = $("#set_manual_positioning").prop("checked");
	var g_set_manual_positioning_z = $("#set_manual_positioning_z").prop("checked");
	var g_penup = $("#set_pen_up").val();
	var g_pendown = $("#set_pen_down").val();
	if (g_set_dry_run)	g_pendown = g_penup;
	var g_travel_speed = parseFloat($("#set_travel_speed").val()) * 60;
	var g_draw_speed = parseFloat($("#set_draw_speed").val()) * 60;
	var g_bed_x = parseFloat($("#set_bed_x").val());
	var g_bed_y = parseFloat($("#set_bed_y").val());
	if(g_set_home_x||g_set_home_y||g_set_home_y){
		gcode_output+= "G28 "+(g_set_home_x?"X":"")+" "+(g_set_home_y?"Y":"")+" "+(g_set_home_z?"Z":"")+"\r\n";
	}
	if(g_set_manual_positioning)
		gcode_output += addManualPositioning(g_set_manual_positioning_z, g_penup, g_travel_speed);
	var lastpos = [];
	var first_move = true;
	gcode_output+= "G0 Z"+g_penup+" F"+g_travel_speed+"\r\n";
	gcode_output+= "G0 X"+(GCODE_DATA[0][0])+" Y"+(GCODE_DATA[0][1])+" F"+g_travel_speed+"\r\n";
	gcode_output+= "G0 Z"+g_pendown+" F"+g_travel_speed+"\r\n";
	for(a=0; a<GCODE_DATA.length; a++){
		gcode_output += "G1 X"+GCODE_DATA[a][2]+" Y"+(GCODE_DATA[a][3])+" F"+(first_move?g_travel_speed:g_draw_speed)+"\r\n";
		if(typeof GCODE_DATA[a+1]!='undefined' && (GCODE_DATA[a][2]!=GCODE_DATA[a+1][0] || GCODE_DATA[a][3]!=GCODE_DATA[a+1][1])){
			gcode_output+= "G0 Z"+g_penup+" F"+g_travel_speed+"\r\n";
			gcode_output+= "G0 X"+(GCODE_DATA[a+1][0])+" Y"+(GCODE_DATA[a+1][1])+" F"+g_travel_speed+"\r\n";
			gcode_output+= "G0 Z"+g_pendown+" F"+g_travel_speed+"\r\n";
		}
		first_move = false;
	}
	gcode_output+= "G0 Z"+g_penup+" F"+g_travel_speed+"\r\n";
	if(g_set_manual_positioning)
		gcode_output+= "G53 ;Restore Workspace\r\n";
	gcode_output+= "G28 X\r\n";
	download("3d_writer.gcode", gcode_output);

}
function addManualPositioning(ignore_z, pen_up, travel_speed) {
	let gcode_init = ignore_z ? `G0 Z${pen_up} F${travel_speed} ;Move to offset setting height\r\n` : "";

	const offset_all = "G92 X0 Y0 Z0 ;Workspace Offset\r\n";
	const steppers_all = "M18 ;Disable Steppers\r\n";
	let offset_xy = `G92 X0 Y0 Z${pen_up} ;Workspace Offset\r\n`;
	const steppers_xy = "M18 X Y ;Disable X and Y Steppers (Z is fixed)\r\n";
	
	let chosen_offset = ignore_z ? offset_xy : offset_all;
	let chosen_steppers = ignore_z ? steppers_xy : steppers_all;

	let gcode = 
	"G92.1 ;Clear previous offsets\r\n" +
	gcode_init +
	chosen_steppers +
	"G4 P1000 ;Wait 1s to not have accidental double click\r\n" +
	"M300 S440 P200 ;Beep\r\n" +
	"M0 Set offset and click\r\n" +
	"M17 ;Enable Steppers\r\n" +
	"M428 ;Offset HERE\r\n" +
	chosen_offset;

	return gcode;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RENDER FUNCTIONS - END //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FONT EDITOR - START /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var fe_unsaved = false;
function start_font_editor(){
	$(".main_app").slideUp();
	$(".font_edit_app").slideDown();
}
function end_font_editor(){
	if(fe_unsaved){
		bootbox.confirm("Close font editor without saving?", function(result){ 
			if(result){
				close_font_editor();
				fe_unsaved = false;
			}
		});
	}else{
		close_font_editor();
	}
}
function close_font_editor(){
	$(".main_app").slideDown();
	$(".font_edit_app").slideUp();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FONT EDITOR - END ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////