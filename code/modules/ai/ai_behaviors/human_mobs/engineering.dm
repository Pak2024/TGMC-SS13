/datum/ai_behavior/human
	///A list of engineering related actions
	var/list/engineering_list = list()
	///Chat lines for trying to build
	var/list/building_chat = list("Строю.", "Строю, прикройте!", "Прикройте меня!", "Начинаю строительство.", "Работаю.", "Я над этим работаю.")
	///Chat lines for being unable to build something
	var/list/unable_to_build_chat = list("Не смогу построить.", "Недостаточно материалов.", "Я не могу это построить.", "Негатив.", "Нужен кто-то другой.")

///Checks if we should be building anything
/datum/ai_behavior/human/proc/engineer_process()
	if(!length(engineering_list))
		return
	if(interact_target && (interact_target in engineering_list))
		return
	if(human_ai_state_flags & HUMAN_AI_FIRING)
		return
	if(current_action == MOVING_TO_SAFETY)
		return
	if(human_ai_state_flags & HUMAN_AI_BUSY_ACTION)
		return
	if(mob_parent.incapacitated() || mob_parent.lying_angle)
		return

	var/atom/engie_target
	var/target_dist = 10
	for(var/atom/potential AS in engineering_list)
		var/dist = get_dist(mob_parent, potential)
		if(dist >= target_dist)
			continue
		if(istype(potential, /obj/effect/build_designator))
			var/obj/effect/build_designator/hologram = potential
			if(hologram.builder)
				continue
		engie_target = potential
		target_dist = dist
	if(!engie_target)
		return

	set_interact_target(engie_target)
	return TRUE

///Adds atom to list
/datum/ai_behavior/human/proc/add_to_engineering_list(atom/new_target)
	engineering_list |= new_target

///Removes atom from list
/datum/ai_behavior/human/proc/remove_from_engineering_list(atom/old_target)
	engineering_list -= old_target

///Our building ended, successfully or otherwise
/datum/ai_behavior/human/proc/on_engineering_end(atom/old_target)
	SIGNAL_HANDLER
	human_ai_state_flags &= ~HUMAN_AI_BUILDING
	if(QDELETED(old_target))
		remove_from_engineering_list(old_target)
	late_initialize()

///Decides if we should do something when a new build hologram appears
/datum/ai_behavior/human/proc/on_holo_build_init(datum/source, obj/effect/build_designator/new_holo)
	SIGNAL_HANDLER
	if(new_holo.faction != mob_parent.faction)
		return
	if(new_holo.z != mob_parent.z)
		return

	add_to_engineering_list(new_holo)
	if(get_dist(mob_parent, new_holo) > 5)
		return
	set_interact_target(new_holo)

///Tries to build a holo designation
/datum/ai_behavior/human/proc/try_build_holo(obj/effect/build_designator/hologram)
	if(hologram.builder)
		remove_from_engineering_list(hologram)
		add_to_engineering_list(hologram)
		return
	human_ai_state_flags |= HUMAN_AI_BUILDING
	do_unset_target(hologram, FALSE)

	var/obj/item/stack/building_stack
	for(var/candidate in mob_inventory.engineering_list)
		if(!istype(candidate, hologram.material_type))
			continue
		var/obj/item/stack/candi_stack = candidate
		if(candi_stack.amount < hologram.recipe.req_amount)
			continue
		building_stack = candi_stack
		break

	if(!building_stack)
		remove_from_engineering_list(hologram)
		try_speak(pick(unable_to_build_chat))
		human_ai_state_flags &= ~HUMAN_AI_BUILDING
		return

	try_speak(pick(building_chat))
	hologram.attackby(building_stack, mob_parent)
	on_engineering_end(hologram)
