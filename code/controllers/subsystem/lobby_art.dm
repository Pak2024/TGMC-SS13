SUBSYSTEM_DEF(lobby_art)
	name = "Lobby Art"
	init_order = INIT_ORDER_ATOMS - 1
	flags = SS_NO_FIRE

	var/selected_file_name
	var/selected_icon_path

/datum/controller/subsystem/lobby_art/Initialize()
	var/list/lobby_arts = CONFIG_GET(str_list/lobby_art_images)

	if(!length(lobby_arts))
		for(var/file_name in flist("icons/misc/lobby_art/"))
			if(findtext(file_name, ".dmi"))
				lobby_arts += replacetext(file_name, ".dmi", "")

	if(!length(lobby_arts))
		return SS_INIT_SUCCESS

	selected_file_name = pick(lobby_arts)
	selected_icon_path = "icons/misc/lobby_art/[selected_file_name].dmi"

	if(!fexists(selected_icon_path))
		log_world("SSlobby_art: file not found: [selected_icon_path]")
		selected_file_name = null
		selected_icon_path = null

	return SS_INIT_SUCCESS
