function Summary() {
    self = this;

    this.el = {
        black_bullion_cost: $('#bb-cost'),
        criterion_upgrade_cost: $('#cu-cost'),
        astral_fuse_cost: $('#af-cost')
    };

    this.updateAllStats = function() {
        self.updateCosts();
        self.updatePrimaryStats();
        self.updateOffensiveDefensiveStats();
    };

    this.collectAllStats = function() {
        return {
            primary: self.collectPrimaryStats(),
            offensive_defensive: self.collectOffensiveDefensiveStats()
        };
    };

    this.updateCosts = function() {
        var blackBullions = 0;
        var criterionUpgrades = 0;
        var astralFuses = 0;
        for (var slotId in slots) {
            if (slots.hasSlot(slotId)) {
                var slot = slots[slotId];
                blackBullions += slot.blackBullionCost();
                criterionUpgrades += slot.criterionUpgradeCost();
                astralFuses += slot.astralFuseCost();
            }
        }
        this.el.black_bullion_cost.html(blackBullions);
        this.el.criterion_upgrade_cost.html(criterionUpgrades);
        this.el.astral_fuse_cost.html(astralFuses);
    };

    this.updatePrimaryStats = function() {
        var sums = this.collectPrimaryStats();

        for (var stat in sums) {
            if (sums.hasOwnProperty(stat)) {
                this.updateOnePrimaryStat(stat, sums[stat]);
            }
        }
        this.updateCosts();
    };

    this.updateOnePrimaryStat = function(stat, value) {
        $('#stat-' + stat).text(value);
    };

    this.collectPrimaryStats = function() {
        var sums = {
            'combat-power': 0,
            'weapon-power': 75,
            'hitpoints': 1970,
            'attack-rating': 0,
            'heal-rating': 0
        };

        for (var slotId in slots) {
            if (slots.hasSlot(slotId)) {
                var slot = slots[slotId];
                var role = slot.role();
                var ql = slot.ql();
                if (slot.group == 'major') {
                    var signet = slot.signet();
                    if (signet.id !== 0) {
                        sums[signet.stat] += slot.determineSignetQualityValue(signet);
                    }
                }
                switch (role) {
                    case 'dps':
                        sums['attack-rating'] += custom_gear_data[slot.group].heal_dps['ql' + (ql)].rating;
                        break;
                    case 'healer':
                        sums['heal-rating'] += custom_gear_data[slot.group].heal_dps['ql' + (ql)].rating;
                        break;
                    case 'tank':
                        sums['hitpoints'] += custom_gear_data[slot.group].tank['ql' + (ql)].hitpoints;
                        break;
                    case 'none':
                        if (slot.id == 'weapon') {
                            sums['weapon-power'] = custom_gear_data[slot.group][ql].weapon_power;
                        }
                        break;
                    default:
                        console.log('Illegal role value when collecting primary stats');
                        break;
                }
            }
        }
        sums['combat-power'] = this.calculateCombatPower(sums['attack-rating'], sums['weapon-power']);
        return sums;
    };

    this.calculateCombatPower = function(attack_rating, weapon_power) {
        return Math.round((375 - (600 / (Math.pow(Math.E, (attack_rating / 1400)) + 1))) * (1 + (weapon_power / 375)));
    };

    this.updateOffensiveDefensiveStats = function() {
        var sums = this.collectOffensiveDefensiveStats();

        this.updateGlyphValues();
        this.updateStats(sums);
        this.updateCosts();
    };

    this.collectOffensiveDefensiveStats = function() {
        var sums = {
            'critical-rating': 0,
            'critical-chance': 0,
            'critical-power': 0,
            'critical-power-percentage': 0,
            'penetration-rating': 0,
            'hit-rating': 0,
            'block-rating': 0,
            'defense-rating': 0,
            'evade-rating': 0,
            'physical-protection': 249,
            'magical-protection': 249
        };
        for (var slotId in slots) {
            if (slots.hasSlot(slotId)) {
                var slot = slots[slotId];
                sums[slot.primaryGlyph()] += slot.primaryGlyphValue();
                sums[slot.secondaryGlyph()] += slot.secondaryGlyphValue();
            }
        }

        sums['critical-chance'] = this.calculateCriticalChance(sums['critical-rating']);
        sums['critical-power-percentage'] = this.calculateCriticalPowerPercentage(sums['critical-power']);
        return sums;
    };

    this.updateGlyphValues = function() {
        for (var slotId in slots) {
            if (slots.hasSlot(slotId)) {
                var slot = slots[slotId];
                slot.updateGlyphValues();
            }
        }
    };

    this.calculateCriticalChance = function(critical_rating) {
        return 39 - (68 / (Math.pow(Math.E, (critical_rating / 787.6)) + 1)).toFixed(2);
    };

    this.calculateCriticalPowerPercentage = function(critical_power) {
        return Math.sqrt(5 * critical_power + 625).toFixed(2);
    };

    this.updateStats = function(sums) {
        for (var stat in sums) {
            if (sums.hasOwnProperty(stat)) {
                if (sums[stat] > 0) {
                    $('#stat-' + stat).html(this.isStatPercentageBased(stat) ? sums[stat].toString().substring(0, 4) + " %" : '+' + sums[stat]);
                } else {
                    $('#stat-' + stat).html(this.isStatPercentageBased(stat) ? "0 %" : "0");
                }
            }
        }
    };

    this.isStatPercentageBased = function(statName) {
        return statName == 'critical-power-percentage' || statName == 'critical-chance';
    };
}