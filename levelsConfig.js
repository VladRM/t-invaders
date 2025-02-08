export const levelsConfig = {
    level1: {
        key: 'Level1',
        nextLevel: 'Level2',
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
    },
    level2: {
        key: 'Level2',
        nextLevel: 'Level3',
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
    },
    level3: {
        key: 'Level3',
        nextLevel: 'Level4',
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
    },
    level4: {
        key: 'Level4',
        nextLevel: null,  // Final level
        enemyGroups: [
            {
                config: { moveSpeed: 75, yOffset: 50 },
                enemyRows: [
                    {
                        count: 2,
                        spacing: 'gameWidth / 2',
                        startX: 'gameWidth / 4',
                        y: 50,
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
                config: { moveSpeed: 150, yOffset: 150 },
                enemyRows: [
                    {
                        count: 7,
                        spacing: 80,
                        startX: '(gameWidth - (80 * 6)) / 2',
                        y: 150,
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
        ]
    }
};
