(function () {
    let $el_form_files = document.getElementById("form-files");
    let $el_section_visualization = document.getElementById("section-visualization");
    let $el_button_reset_position = document.getElementById("reset-position");
    let $el_button_previous = document.getElementById("button-previous");
    let $el_button_next = document.getElementById("button-next");
    let $el_canvas_main = document.getElementById("canvas-main");
    let $el_span_sprite_name = document.getElementById("sprite-name");
    let $el_button_download_current = document.getElementById("download-current");
    let $el_button_download_all = document.getElementById("download-all");
    let $el_img = document.createElement("img");
    let $filereader_xml = new FileReader();
    let $context_canvas_main = $el_canvas_main.getContext("2d");
    let $fontface_comic_sans_ms = new FontFace("Comic Sans MS", "url(\"fonts/comic.ttf\")");
    let $is_form_files_submitted = false;
    let $text_sprite_name = $el_span_sprite_name.childNodes[0];
    let $maximum_height = 0;
    let $collection_sprite;
    let $visualization_position = 0;
    function $write_wait_text() {
        let $canvas_parent = $el_canvas_main.parentElement;
        $el_canvas_main.width = $canvas_parent.offsetWidth;
        $context_canvas_main.clearRect(0, 0, $el_canvas_main.clientWidth, $el_canvas_main.clientHeight);
        $context_canvas_main.font = "2em \"Comic Sans MS\"";
        $context_canvas_main.textAlign = "center";
        $context_canvas_main.textBaseline = "middle";
        $context_canvas_main.fillText("Aguardando confirmação.", $el_canvas_main.clientWidth / 2, $el_canvas_main.clientHeight / 2, $el_canvas_main.clientWidth);
    }
    function $set_canvas_to_wait_state() {
        if ($is_form_files_submitted) return;
        $fontface_comic_sans_ms.load().then($write_wait_text);
    }
    function $prevent_form_submission($_event) {
        $_event.preventDefault();
    }
    function $read_xml_file() {
        let $formvalue_xml = $formdata_files.get("xml");
        $filereader_xml.readAsText($formvalue_xml);
    }
    function $load_image($_event) {
        $el_img.src = $_event.currentTarget.result;
        $el_img.addEventListener("load", $read_xml_file);
    }
    function $load_sprite() {
        let $canvas_parent = $el_canvas_main.parentElement;
        let $sprite = $collection_sprite[$visualization_position];
        let $value_n = $sprite.getAttribute("n");
        let $value_h = $sprite.getAttribute("h");
        let $value_w = $sprite.getAttribute("w");
        let $value_x = $sprite.getAttribute("x");
        let $value_y = $sprite.getAttribute("y");
        $el_canvas_main.height = $value_h;
        $el_canvas_main.width = $value_w;
        $canvas_parent.style["width"] = `${$value_w}px`;
        $el_canvas_main.setAttribute("data-name", $value_n);
        $context_canvas_main.clearRect(0, 0, $el_canvas_main.clientWidth, $el_canvas_main.clientHeight);
        $context_canvas_main.drawImage($el_img, -$value_x, -$value_y);
        $text_sprite_name.remove();
        $text_sprite_name = document.createTextNode($value_n);
        $el_span_sprite_name.append($text_sprite_name);
        ($visualization_position > 0)
        ? $el_button_previous.removeAttribute("disabled")
        : $el_button_previous.setAttribute("disabled", "disabled");
        ($visualization_position < $collection_sprite.length - 1)
        ? $el_button_next.removeAttribute("disabled")
        : $el_button_next.setAttribute("disabled", "disabled");
    }
    function $reset_position() {
        $visualization_position = 0;
        $load_sprite();
    };
    function $action_previous() {
        if ($visualization_position > 0) $visualization_position--;
        $load_sprite();
    }
    function $action_next() {
        if ($visualization_position < $collection_sprite.length - 1) $visualization_position++;
        $load_sprite();
    }
    function $download_current_sprite() {
        let $sprite_name = prompt("Insira o nome da imagem", $el_canvas_main.getAttribute("data-name"));
        if (!$sprite_name) return;
        let $el_a_download = document.createElement("a");
        $el_a_download.download = $sprite_name;
        $el_a_download.href = $el_canvas_main.toDataURL();
        $el_a_download.click();
    }
    function $handle_sprites($_sprite) {
        let $sprite = $_sprite;
        let $el_a_download = document.createElement("a");
        let $el_canvas_temporary = document.createElement("canvas");
        let $context_canvas_temporary = $el_canvas_temporary.getContext("2d");
        let $value_n = $sprite.getAttribute("n");
        let $value_h = $sprite.getAttribute("h");
        let $value_w = $sprite.getAttribute("w");
        let $value_x = $sprite.getAttribute("x");
        let $value_y = $sprite.getAttribute("y");
        $el_canvas_temporary.height = $value_h;
        $el_canvas_temporary.width = $value_w;
        $el_canvas_temporary.setAttribute("data-name", $value_n);
        $el_a_download.download = $el_canvas_temporary.getAttribute("data-name");
        $context_canvas_temporary.drawImage($el_img, -$value_x, -$value_y);
        $el_a_download.href = $el_canvas_temporary.toDataURL();
        $el_a_download.click()
        $el_canvas_temporary.remove();
        $el_a_download.remove();
    }
    function $download_all_sprites() {
        let $array_sprite = Array.from($collection_sprite);
        $array_sprite.forEach($handle_sprites);
    }
    function $validate_sprite($_sprite) {
        let $sprite = $_sprite;
        let $value_h = $sprite.getAttribute("h");
        let $value_w = $sprite.getAttribute("w");
        if ($value_h <= 5 || $value_w <= 5) $_sprite.remove();
    }
    function $set_maximum_height($_sprite) {
        let $value_h = $_sprite.getAttribute("h");
        if (parseInt($value_h) > $maximum_height) $maximum_height = $value_h;
    }
    function $load_first_sprite() {
        $visualization_position = 0;
        $load_sprite();
    }
    function $load_xml($_event) {
        let $canvas_parent = $el_canvas_main.parentElement;
        let $domparser_xml = new DOMParser();
        let $xml = $domparser_xml.parseFromString($_event.currentTarget.result, "text/xml");
        let $texture_atlas = $xml.getElementsByTagName("TextureAtlas")[0];
        let $omit_empty = $formdata_files.get("omit-empty");
        let $array_sprite;
        $collection_sprite = $texture_atlas.getElementsByTagName("sprite");
        $array_sprite = Array.from($collection_sprite);
        if ($omit_empty == "on") $array_sprite.forEach($validate_sprite);
        $array_sprite.forEach($set_maximum_height);
        $canvas_parent.style["height"] = `${$maximum_height}px`;
        $el_button_reset_position.removeAttribute("disabled");
        $el_button_reset_position.addEventListener("click", $reset_position);
        $el_button_previous.addEventListener("click", $action_previous);
        $el_button_next.removeAttribute("disabled");
        $el_button_next.addEventListener("click", $action_next);
        scrollTo(0, $el_section_visualization.offsetTop);
        $load_first_sprite();
        $el_button_download_current.removeAttribute("disabled");
        $el_button_download_current.addEventListener("click", $download_current_sprite);
        $el_button_download_all.removeAttribute("disabled");
        $el_button_download_all.addEventListener("click", $download_all_sprites);
    }
    function $handle_form_files() {
        let $filereader_image = new FileReader();
        let $formvalue_image;
        $is_form_files_submitted = true;
        $formdata_files = new FormData($el_form_files);
        $formvalue_image = $formdata_files.get("image");
        $filereader_image.addEventListener("load", $load_image);
        $filereader_xml.addEventListener("load", $load_xml);
        $filereader_image.readAsDataURL($formvalue_image);
    }
    $set_canvas_to_wait_state();
    window.addEventListener("resize", $set_canvas_to_wait_state);
    $el_form_files.addEventListener("submit", $prevent_form_submission);
    $el_form_files.addEventListener("submit", $handle_form_files);
})();