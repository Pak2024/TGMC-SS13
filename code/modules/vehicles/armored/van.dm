/obj/vehicle/sealed/armored/multitile/van
	name = "\improper VAN - Darkholme"
	desc = "An unarmed VAN designed to transport people and cargo."
	icon = 'icons/obj/armored/2x3/van.dmi'
	icon_state = "van"
	damage_icon_path = 'icons/obj/armored/2x3/van_damage_overlay.dmi'
	hitbox = /obj/hitbox/two_three
	interior = /datum/interior/armored/van
	permitted_weapons = NONE
	permitted_mods = list(/obj/item/tank_module/ability/tesla)
	armored_flags = ARMORED_HAS_HEADLIGHTS|ARMORED_HAS_UNDERLAY|ARMORED_WRECKABLE|ARMORED_PURCHASABLE_TRANSPORT|ARMORED_SELF_WALL_DAMAGE
	required_entry_skill = SKILL_LARGE_VEHICLE_DEFAULT
	minimap_icon_state = "van"
	turret_icon = null
	pixel_x = -24
	pixel_y = -32
	pixel_w = 0
	pixel_z = 0
	max_integrity = 900
	soft_armor = list(MELEE = 50, BULLET = 100 , LASER = 90, ENERGY = 60, BOMB = 60, BIO = 100, FIRE = 50, ACID = 50)
	hard_armor = list(MELEE = 0, BULLET = 20, LASER = 20, ENERGY = 20, BOMB = 0, BIO = 20, FIRE = 0, ACID = 0)
	max_occupants = 12
	enter_delay = 0.4 SECONDS
	ram_damage = 30
	move_delay = 0.15 SECONDS
	glide_size = 8.5
	easy_load_list = list(
		/obj/item/ammo_magazine/tank,
		/obj/structure/largecrate,
		/obj/structure/closet/crate,
	)

/obj/vehicle/sealed/armored/multitile/van/Initialize(mapload)
	. = ..()
	var/obj/item/tank_module/module = new /obj/item/tank_module/ability/tesla()
	module.on_equip(src)

/obj/vehicle/sealed/armored/multitile/van/setDir(newdir)
	. = ..()
	if(armored_flags & ARMORED_IS_WRECK)
		update_smoke_dir(null, null, newdir)

/obj/vehicle/sealed/armored/multitile/van/enter_locations(atom/movable/entering_thing)
	var/first_turf = get_step_away(get_step(src, REVERSE_DIR(dir)), src, 2)
	return list(
		first_turf,
		get_step(first_turf, turn(dir, -90)),
	)

/obj/vehicle/sealed/armored/multitile/van/wreck_vehicle()
	. = ..()
	update_smoke_dir(newdir = dir)

/obj/vehicle/sealed/armored/multitile/van/update_smoke_dir(datum/source, dir, newdir)
	switch(newdir)
		if(SOUTH)
			smoke_holder.particles.position = list(20, 16, 0)
		if(NORTH)
			smoke_holder.particles.position = list(-4, 73, 0)
		if(EAST)
			smoke_holder.particles.position = list(70, 35, 0)
		if(WEST)
			smoke_holder.particles.position = list(10, 35, 0)
