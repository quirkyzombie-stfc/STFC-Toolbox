export const enum Stats {
    SHIELD_DEFLECTION = "-2",
    DODGE = "11",
    ARMOR = "-3",

    ACCURACY = "6",
    ARMOR_PIERCING = "7",
    SHIELD_PIERCING = "8",
    
    CRIT_CHANCE = "9",
    CRIT_DAMAGE = "10",

    SHIELD_HEALTH = "60",
    HULL_HEALTH = "61",

    DAMAGE_PER_ROUND = "-1",
}

export const enum Attributes {
    OFFICER_ATTACK_BONUS = "-15",
    OFFICER_DEFENSE_BONUS = "-16",
    OFFICER_HEALTH_BONUS = "-17",
}

export const enum CombatLogEvent {
    START_ROUND = -96,
    END_ROUND = -97,
    START_ATTACK = -98,
    END_ATTACK = -99,
    ATTACK_CHARGE = -95,
    START_SUB_ROUND = -90,
    END_SUB_ROUND = -89,
    OFFICER_ABILITIES_FIRING = -93,
    OFFICER_ABILITIES_FIRED = -94,
    OFFICER_ABILITY_START = -91,
    OFFICER_ABILITY_END = -92,
    OFFICER_ABILITIES_APPLIED_START = -88,
    OFFICER_ABILITIES_APPLIED_END = -87,
    OFFICER_ABILITY_APPLIED_START = -86,
    OFFICER_ABILITY_APPLIED_END = -85,
}

export function hullName(id: number) {
    switch (id) {
        case 2968519195: return "ECS Fortunate";
        case 2869476908: return "K'Vort";
        case 3014221215: return "Envoy";
        case 3046584086: return "ECS Horizon";
        case 1535317053: return "Valkis";
        case 1029262994: return "North Star";

        case 987222969: return "Realta";
        case 34867572: return "Orion Corvette";
        case 1842444641: return "Turas";
        case 1279606467: return "Phindra";
        case 354762123: return "Talla";
        case 2919480363: return "Jellyfish";
        case 3005922948: return "Kumari";
        case 1220133742: return "USS Mayflower";
        case 3554487827: return "Legionary";
        case 2704762692: return "D3";
        case 673187302: return "Centurion";
        case 1463338054: return "USS Intrepid";
        case 2441576367: return "B'Rel";
        case 3056258007: return "USS Saladin";
        case 2004925834: return "Bortas";
        case 2529591723: return "Vi'Dar";
        case 3459465041: return "Augur";
        case 2483093372: return "USS Enterprise";
        case 2165876444: return "Gladius";
        case 1628890938: return "ISS Jellyfish";
        case 644714972: return "USS Franklin";
        case 1087128295: return "Botany Bay";
        case 2016654425: return "USS Franklin-A";
        case 293385368: return "Stella";
        case 1307832955: return "USS Discovery";
        case 593579233: return "Sarcophagus";
        case 711428193: return "USS Kelvin";
        case 1027217748: return "Valdore";
        case 1244824002: return "K'T'inga";
        case 957865248: return "D4";
        case 108924704: return "USS Antares";
        case 2057434885: return "USS Newton";
        case 1784814733: return "D'Vor";

        case 2545673906: return "Klingon Patrol (38)";
        case 452810712: return "Heavy Klingon Transport (49)";

        case 2178302361: return "Federation Trader (20)";
        case 2899777159: return "Federation Trader (21)";
        case 3321247803: return "Federation Trader (22)";
        case 1783141115: return "Federation Trader (23)";
        case 2722281308: return "Federation Trader (24)";
        case 2830826295: return "Federation Trader (25)";
        case 2844399716: return "Federation Patrol (25)";
        case 2984938199: return "Federation Trader (26)";
        case 3814893865: return "Federation Trader (27)";
        case 1552800047: return "Federation Trader (28)";
        case 1857945819: return "Federation Trader (29)";
        case 3135245753: return "Federation Trader (30)";
        case 1714034964: return "Federation Trader (31)";
        case 3565756303: return "Federation Trader (32)";
        case 2806799197: return "Federation Trader (34)";
        case 1386444588: return "Federation Trader (35)";
        case 3842891461: return "Federation Trader (36)";
        case 3395494907: return "Federation Trader (39)";
        case 4036608042: return "Federation Trader (40)";
        case 290290122: return "Federation Trader (41)";
        case 1541892501: return "Federation Scout (40)";
        case 2172240925: return "Federation Patrol (39)";
        case 1872418835: return "Federation Patrol (40)";
        case 31096395: return "Federation Patrol (41)";
        case 881724454: return "Federation Heavy Transport (49)";

        case 1055567535: return "Romulan Patrol (37)";
        case 3225234874: return "Romulan Patrol (36)";
        case 3649227771: return "Romulan Patrol (35)";
        case 3239303221: return "Romulan Patrol (35)";
        case 858181106: return "Romulan Patrol (34)";
        case 2813079872: return "Romulan Patrol (33)";
        case 3622005155: return "Romulan Patrol (33)";
        case 1940084238: return "Romulan Patrol (32)";
        case 2242441158: return "Romulan Patrol (32)";
        case 1401508332: return "Romulan Patrol (31)";
        case 142778966: return "Romulan Patrol (31)";
        case 3082364530: return "Romulan Patrol (30)";
        case 918739805: return "Romulan Patrol (30)";
        case 342459642: return "Romulan Transport (49)";

        case 829090968: return "Klingon Patrol (32)";
        case 2564938431: return "Klingon Patrol (33)";
        case 58368256: return "Klingon Patrol (34)";
        case 3170138507: return "Klingon Patrol (34)";

        case 665930490: return "Swarm Cluster (32)";
        case 2116041048: return "Swarm Cluster (39)";
        case 3377289422: return "Swarm Cluster (43)";

        case 1728739907: return "Arconian Captain (37)";
        case 177110642: return "Arconian Captain (38)";
        case 2567247778: return "Boslic Slave Trader (15)";
        case 4136448346: return "Boslic Slave Trader (16)";
        case 2660345725: return "Boslic Slave Trader (19)";
        case 4039623697: return "Boslic Slave Trader (20)";
        case 3966556761: return "Boslic Slave Trader (21)";

        case 4249895316: return "Vaaran Marauder (35)";
        case 2158699249: return "Vaaran Marauder (36)";

        case 2185341654: return "Takret Militia (10)";
        case 2652523520: return "Takret Militia (11)";
        case 4232060620: return "Takret Militia (12)";

        case 538854361: return "Suliban Bountry Hunter (28)";
        case 606142324: return "Suliban Bountry Hunter (29)";
        case 3920685812: return "Suliban Bountry Hunter (30)";
        case 3444911860: return "Suliban Bountry Hunter (32)";
        case 338318482: return "Suliban Bountry Hunter (34)";
        case 41449331: return "Suliban Bountry Hunter (33)";
        case 2801631091: return "Suliban Bounty Hunter (35)";
        case 3610165283: return "Suliban Bounty Hunter (36)";
        case 544778756: return "Suliban Bounty Hunter (37)";
        case 2444846994: return "Suliban Bounty Hunter (??)";

        case 2633876623: return "Separatist Boss (KLI)";
        case 3982680616: return "Separatist Boss (FED)";
        case 1735892107: return "Separatist Boss (ROM)";

        case 418878778: return "Borg Tactical Probe (30)";
        case 146877899: return "Borg Tactical Probe (31)";
        case 298715189: return "Borg Tactical Probe (33)";
        case 2575881383: return "Assimilated Ferengi Trader (33)"

        case 725283992: return "Mega Cube Disruptor";
        case 2597860098: return "Mega Cube Photon Cannon";
        case 4072660388: return "Borg Cube (25)";
        case 3209728498: return "Borg Cube (25)"; // Duplicate?
        case 229914656: return "Borg Tactical Cube (30)";
        case 3141083773: return "Borg Tactical Cube (30)"; // Duplicate?

        case 19652465: return "Federation Outpost (27)";
        case 757270999: return "Federation Outpost (29)";
        case 4252654473: return "Federation Outpost (35)";
        case 144468858: return "Federation Outpost (43)";
        case 845047200: return "Federation Outpost (46)";
        case 333555142: return "Federation Supply Dock (35)";
        case 3648469941: return "Federation Supply Dock (38)";
        case 4237913784: return "Federation Supply Dock (41)";
        case 4289982823: return "Federation Supply Dock (44)";

        case 1740209250: return "Romulan Watchpost (31)";
        case 117396251: return "Romulan Watchpost (33)";
        case 2296447866: return "Romulan Watchpost (35)";
        case 4239480548: return "Romulan Watchpost (37)";
        case 367659711: return "Romulan Garrison (35)";
        case 2323064367: return "Romulan Garrison (41)"
        case 1747347632: return "Romulan Garrison (44)";
        case 3933806291: return "Romulan Citadel (39)";
        case 2969696601: return "Romulan Citadel (42)";

        case 2934807300: return "Slave Market (35)";
        case 1804157820: return "Slave Market (38)";
        case 776983977: return "Marauder Haven (39)";
        case 3202812360: return "Pirate Stronghold (36)";

        case 3289708242: return "Klingon Sentrypost (27)";
        case 4260531045: return "Klingon Sentrypost (35)";
        case 2921933753: return "Klingon Sentrypost (37)";
        case 3611802277: return "Klingon Sentrypost (39)";
        case 1302613636: return "Klingon Sentrypost (41)";
        case 3174852211: return "Klingon Arsenal (35)";
        case 1602927238: return "Klingon Arsenal (41)";
        case 2322100363: return "Klingon Fortress (42)";

        case 3050436003: return "Exchange Transport (40)";

        case 4257014791: return "Exchange High Security Vault (45)";
        case 3017440012: return "Exchange High Security Vault (40)";
        case 1025523129: return "Exchange High Security Vault (37)";
        case 138161244:  return "Exchange High Security Vault (35)";
        case 2386832117: return "Exchange High Security Vault (33)";
        
        case 2659665232: return "Exchange Vault (40)";
        case 2346183187: return "Exchange Vault (37)";
        case 2781004548: return "Exchange Vault (35)";
        case 2108051002: return "Exchange Vault (33)";
        case 312952105:  return "Exchange Vault (31)";

        case 4130274289: return "Exchange Bank (40)";
        case 2012657772: return "Exchange Bank (37)";
        case 2968515932: return "Exchange Bank (35)";
        case 1834704796: return "Exchange Bank (33)";
        case 2739482693: return "Exchange Bank (31)";
        case 3870064090: return "Exchange Bank (29)";
        case 3734850502: return "Exchange Bank (27)";

        case 1155810330: return "Swarm Horde (40)";

        // Mission targets
        case 3080902039: return "Kreele's Battleship";
        case 3171157451: return "Corvallen Spy";
        case 526178654: return "Romulan Assassin";
        case 3171157451: return "Klingon Ship";
        case 1378127206: return "Tal Shiar Ship";

        default: return `<#${id}>`;
    }
}
export function activatorName(id: number) {
    switch (id) {
        case 656972203: return "Nero";
        case 3627600020: return "6of10";
        case 3583932904: return "5of10";
        case 1131760724: return "8of10";
        case 3304441016: return "7of10";
        case 1859906553: return "9of10";
        case 989647182: return "1of10";
        case 370544309: return "10of10";
        case 2822661458: return "Khan";
        case 988947581: return "Kirk";
        case 766809588: return "Spock";
        case 1983456684: return "Kumak";
        case 2959514562: return "Vemet";
        case 3923643019: return "Bones";
        case 1143746577: return "Zhou";
        case 339936167: return "Arix";
        case 2219055924: return "Otto";
        case 3528103772: return "Joaquin";
        case 1602389738: return "Kati";
        case 513311144: return "D'Jaoki";
        case 531187684: return "Mirek";
        case 3961190554: return "Decius";
        case 329940464: return "Pike";
        case 2765885322: return "Chen";
        case 1127234629: return "Marcus";
        case 3553398304: return "Harrison";
        case 3990993357: return "Moreau";
        case 1608562191: return "Kang";
        case 1353192478: return "Mara";
        case 2695272429: return "Uhura";
        case 3465002315: return "Krell";
        case 194631754: return "Cadet Uhura";
        case 1853520303: return "Cadet McCoy";
        case 4066988596: return "Cadet Sulu";
        case 1525867544: return "Cadet Kirk";
        case 4150311506: return "Cadet Scotty";
        case 1455040265: return "T'Laan";
        case 755079845: return "Stonn";
        case 1250418815: return "Charvanek";
        case 1730335425: return "Chang";
        case 2847497836: return "Kras";
        case 3880112208: return "Kerla";
        case 3381802332: return "Yuki";
        case 2520801863: return "Sulu";
        case 282462507: return "Arcady";
        case 3722250154: return "Carol";
        case 776602621: return "Gaila";
        case 1465017198: return "Gorkon";
        case 3156736320: return "Helvia";
        case 3816036121: return "Domitia";
        case 2333021829: return "Livis";
        case 1622062016: return "Instructor Spock";
        case 98548875: return "Woteln";
        case 1556052341: return "T'Pring";
        case 2518604778: return "Barot";
        case 407568868: return "Zahra";
        case 4219901626: return "0718";
        case 668528267: return "Javaid";
        case 949329475: return "Euridyce";
        case 229898163: return "Ahvix";
        case 307877748: return "Leslie";
        case 2030703558: return "Stamets";
        case 56060748: return "Saru";
        case 440622131: return "Culbert";
        case 3106264505: return "Tiza";
        case 4132174205: return "Mitchell";
        case 2475235160: return "Azetbur";
        case 3264304828: return "Joachim";
        case 3492633912: return "Keenser";
        case 1617168639: return "Marla";
        case 3314108979: return "Hadley";
        case 3628828668: return "Hendorff";
        case 3999633781: return "Burnham";
        case 1580157615: return "Georgiou";
        case 56060748: return "Saru";
        case 1800794103: return "Tilly";
        case 3769449499: return "Tyler";
        case 1330179266: return "Ro Mudd";
        case 423029416: return "TOS McCoy";
        case 107451388: return "TOS Kirk";
        case 1752126880: return "TOS Uhura";
        case 4110037371: return "Lorca";
        case 2517597941: return "Vixis";
        case 3479870516: return "Jaylah";
        case 2651130337: return "Sesha";
        case 634330627: return "Mudd";
        case 677303054: return "Mudd2";
        case 1485791413: return "Next Gen Crusher";
        case 3001921707: return "Yan'agh";


        case 3459465041: return "Augur";
        case 2483093372: return "Enterprise ship ability";
        case 1143746577: return "ISS Jellyfish";
        default: return `<#${id}>`;
    }
}
export function buffName(id: number) {
    switch(id) {
        case 919263260: return "Operations Center";
        case 3655026185: return "Academy?";
        case 434613423: return "Hull Density";
        case 4191797822: return "Shield Modulation";


        default: return `<#${id}>`;
    }
}
export function effectName(id: number) {
    switch (id) {
        default: return `<#${id}>`;
    }
}
export function battleType(id: number) {
    switch (id) {
        case 0: return 'pvp'; // ???
        case 1: return 'station'; // station combat (loss?)
        case 2: return 'pve'; // attacking a hostile (win?)
        case 3: return 'pve'; // attacking a hostile (loss?)
        case 4: return 'pvp'; // ???
        case 5: return 'pve'; // revenge ship 
        case 8: return 'armada';

        default: return '???';
    }
}