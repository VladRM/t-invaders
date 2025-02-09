export const levelsConfig = {
    level0: {
        key: 'Level0',
        nextLevel: 'Level1',
        enemyGroups: [
            {
                config: { moveSpeed: 75, yOffset: 100 },
                enemyRows: [
                    {
                        count: 2,
                        spacing: 'gameWidth / 2',
                        startX: 'gameWidth / 4',
                        y: 0,
                        enemyConfig: {
                            imageKey: 'boss',
                            size: 128,
                            hitPoints: 5,
                            weaponConfig: {
                                multiShotCount: 3,
                                shotAngle: 15,
                                minFireDelay: 2000,
                                maxFireDelay: 4000
                            }
                        }
                    }
                ]
            },
            {
                config: { moveSpeed: 150, yOffset: 328 },
                enemyRows: [
                    {
                        count: 7,
                        spacing: 80,
                        startX: '(gameWidth - (80 * 6)) / 2',
                        y: 0,
                        enemyConfig: {
                            imageKey: 'enemy',
                            size: 48,
                            hitPoints: 1,
                            weaponConfig: {
                                multiShotCount: 1,
                                minFireDelay: 3000,
                                maxFireDelay: 6000
                            }
                        }
                    }
                ]
            }
        ],
    },
    level1: {
        key: 'Level1',
        nextLevel: 'Level2',
        enemyGroups: [
            {
                config: { moveSpeed: 150, yOffset: 100 },
                enemyRows: [
                    {
                        count: 4,
                        spacing: 100,
                        y: 100,
                        enemyConfig: {
                            imageKey: 'enemy',
                            size: 48,
                            hitPoints: 1,
                            minFireDelay: 2000,
                            maxFireDelay: 5000,
                            weaponConfig: {
                                multiShotCount: 1,
                                shotAngle: 0,
                                shotXOffset: 0,
                                projectileSpeed: 300
                            }
                        }
                    }
                ]
            }
        ]
    },
    level2: {
        key: 'Level2',
        nextLevel: 'Level3',
        enemyGroups: [
            {
                config: { moveSpeed: 150, yOffset: 48 },
                enemyRows: [
                    {
                        count: 6,
                        spacing: 100,
                        y: 48,
                        enemyConfig: {
                            imageKey: 'enemy',
                            size: 48,
                            hitPoints: 1,
                            minFireDelay: 2000,
                            maxFireDelay: 5000,
                            weaponConfig: {
                                multiShotCount: 1,
                                shotAngle: 0,
                                shotXOffset: 0,
                                projectileSpeed: 300
                            }
                        }
                    },
                    {
                        count: 6,
                        spacing: 100,
                        y: 120,
                        enemyConfig: {
                            imageKey: 'enemy',
                            size: 48,
                            hitPoints: 1,
                            minFireDelay: 2000,
                            maxFireDelay: 5000,
                            weaponConfig: {
                                multiShotCount: 1,
                                shotAngle: 0,
                                shotXOffset: 0,
                                projectileSpeed: 300
                            }
                        }
                    }
                ]
            }
        ]
    },
    level3: {
        key: 'Level3',
        nextLevel: 'Level4',
        enemyGroups: [
            {
                config: { moveSpeed: 100, yOffset: 120 },
                enemyRows: [
                    {
                        count: 2,
                        spacing: 160,
                        y: 120,
                        enemyConfig: {
                            imageKey: 'boss',
                            size: 96,
                            hitPoints: 10,
                            minFireDelay: 1000,
                            maxFireDelay: 2000,
                            weaponConfig: {
                                multiShotCount: 3,
                                shotAngle: 30,
                                shotXOffset: 20,
                                projectileSpeed: 300
                            }
                        }
                    }
                ]
            }
        ]
    },
    level4: {
        key: 'Level4',
        nextLevel: '',
        enemyGroups: [
            // Group 1: Bosses near the top (2x larger than previous bosses)
            {
                config: { moveSpeed: 100, yOffset: 20 },
                enemyRows: [
                    {
                        count: 2,
                        spacing: 300,
                        y: 0,
                        enemyConfig: {
                            imageKey: 'boss',
                            size: 192,      // 2x bigger than the 96 size used in Level3
                            hitPoints: 20,  // 2x the hit points
                            minFireDelay: 1000,
                            maxFireDelay: 2000,
                            weaponConfig: {
                                multiShotCount: 3,
                                shotAngle: 30,
                                shotXOffset: 20,
                                projectileSpeed: 300
                            }
                        }
                    }
                ]
            },
            // Group 2: One row of 7 smaller enemies
            {
                config: { moveSpeed: 120, yOffset: 300 },
                enemyRows: [
                    {
                        count: 7,
                        spacing: 100,
                        y: 0,
                        enemyConfig: {
                            imageKey: 'enemy',
                            size: 48,
                            hitPoints: 1,
                            minFireDelay: 2000,
                            maxFireDelay: 4000,
                            weaponConfig: {
                                multiShotCount: 1,
                                shotAngle: 0,
                                shotXOffset: 0,
                                projectileSpeed: 300
                            }
                        }
                    }
                ]
            }
        ]
    }
};
