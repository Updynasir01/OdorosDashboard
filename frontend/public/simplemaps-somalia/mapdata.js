var simplemaps_countrymap_mapdata={
  main_settings: {
    //General settings
		width: "responsive", //or 'responsive'
    background_color: "#FFFFFF",
    background_transparent: "yes",
    popups: "detect",
    
		//State defaults
		state_description: "State description",
    state_color: "#88A4BC",
    state_hover_color: "#3B729F",
    state_url: "https://simplemaps.com",
    border_size: 1.5,
    border_color: "#ffffff",
    all_states_inactive: "no",
    all_states_zoomable: "no",
    
		//Location defaults
		location_description: "Location description",
    location_color: "#FF0067",
    location_opacity: 0.8,
    location_hover_opacity: 1,
    location_url: "",
    location_size: 25,
    location_type: "square",
    location_border_color: "#FFFFFF",
    location_border: 2,
    location_hover_border: 2.5,
    all_locations_inactive: "no",
    all_locations_hidden: "yes",
    
		//Label defaults
		label_color: "#111827",
    label_hover_color: "#000000",
    label_size: 14,
    label_font: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    hide_labels: "no",
    hide_eastern_labels: false,
   
		//Zoom settings
		manual_zoom: "yes",
    back_image: "no",
    arrow_box: "no",
    navigation_size: "40",
    navigation_color: "#f7f7f7",
    navigation_border_color: "#636363",
    initial_back: "no",
    initial_zoom: -1,
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.6,
    zoom_out_incrementally: "yes",
    zoom_percentage: 0.99,
    zoom_time: 0.5,
    
		//Popup settings
		popup_color: "white",
    popup_opacity: 0.9,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    popup_nocss: "no",
    
		//Advanced settings
		div: "map",
    auto_load: "yes",
    rotate: "0",
    url_new_tab: "yes",
    images_directory: "default",
    import_labels: "no",
    fade_time: 0.1,
    link_text: "View Website"
  },
  state_specific: {
    SOAW: {
      name: "Awdal",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOBK: {
      name: "Bakool",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOBN: {
      name: "Banadir",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOBR: {
      name: "Bari",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOBY: {
      name: "Bay",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOGA: {
      name: "Galgaduud",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOGE: {
      name: "Gedo",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOHI: {
      name: "Hiraan",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOJD: {
      name: "Mid. Juba",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOJH: {
      name: "Lower Juba",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOMU: {
      name: "Mudug",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SONU: {
      name: "Nugaal",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOSA: {
      name: "Sanaag",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOSD: {
      name: "Mid. Shabelle",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOSH: {
      name: "Lower Shabelle",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOSO: {
      name: "Sool",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOTO: {
      name: "Togdheer",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    SOWO: {
      name: "Woqooyi G.",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    }
  },
  locations: {
    "0": {
      name: "Mogadishu",
      lat: "2.046193",
      lng: "45.33407"
    }
  },
  labels: {
    SOAW: {
      name: "Awdal",
      parent_id: "SOAW"
    },
    SOBK: {
      name: "Bakool",
      parent_id: "SOBK"
    },
    SOBN: {
      name: "Banadir",
      parent_id: "SOBN"
    },
    SOBR: {
      name: "Bari",
      parent_id: "SOBR"
    },
    SOBY: {
      name: "Bay",
      parent_id: "SOBY"
    },
    SOGA: {
      name: "Galgaduud",
      parent_id: "SOGA"
    },
    SOGE: {
      name: "Gedo",
      parent_id: "SOGE"
    },
    SOHI: {
      name: "Hiraan",
      parent_id: "SOHI"
    },
    SOJD: {
      name: "Mid. Juba",
      parent_id: "SOJD"
    },
    SOJH: {
      name: "Lower Juba",
      parent_id: "SOJH"
    },
    SOMU: {
      name: "Mudug",
      parent_id: "SOMU"
    },
    SONU: {
      name: "Nugaal",
      parent_id: "SONU"
    },
    SOSA: {
      name: "Sanaag",
      parent_id: "SOSA"
    },
    SOSD: {
      name: "Mid. Shabelle",
      parent_id: "SOSD"
    },
    SOSH: {
      name: "Lower Shabelle",
      parent_id: "SOSH"
    },
    SOSO: {
      name: "Sool",
      parent_id: "SOSO"
    },
    SOTO: {
      name: "Togdheer",
      parent_id: "SOTO"
    },
    SOWO: {
      name: "Woqooyi G.",
      parent_id: "SOWO"
    }
  }
};