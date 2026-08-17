/datum/asset/simple/lobby_art

/datum/asset/simple/lobby_art/register()
	var/prefix = "icons/misc/lobby_art/"
	var/list/lobby_files = flist(prefix)
	if(!length(lobby_files))
		return
	var/picked = pick(lobby_files)
	var/icon/art = icon("[prefix][picked]")
	if(!art || !art.Width())
		return
	art = fcopy_rsc(art)
	SSassets.transport.register_asset("lobby_art.png", art)
	assets["lobby_art.png"] = art


/datum/asset/simple/lobby_files
	keep_local_name = TRUE
	assets = list(
		"load.mp3" = 'sound/lobby/lobby_load.mp3',
		"tgmc_64.png" = 'icons/tgmc_64.png',
	)


/datum/asset/simple/restart_animation
	assets = list(
		"loading" = 'html/lobby/loading.gif',
	)
