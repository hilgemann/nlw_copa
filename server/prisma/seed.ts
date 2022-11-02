import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main () {
    const user = await prisma.user.create({
        data: {
           name: "Jhon Doe",
           email: "john.doe@gmail.com",
           avatarUrl: "https://github.com/diego3g.png",
        }
    })

    const pool = await prisma.pool.create({
        data: {
            title: "Example pool",
            code: "BOL123",
            ownerId: user.id,

            participants: {
                create: {
                    userId: user.id
                }
            }
        }
    })

    await prisma.game.create({
        data: {
           date: "2022-11-20T12:00:00.201Z",
           firstTeamCountryCode: 'DE',
           secondTeamCountryCode: 'BR'
        }
    })

    await prisma.game.create({
        data: {
           date: "2022-11-20T12:00:00.201Z",
           firstTeamCountryCode: 'DE',
           secondTeamCountryCode: 'BR',

           guesses: {
                create: {
                    firstTeamPoints: 2,
                    secondTeamPoints: 1,

                    participant: {
                        connect: {
                            userId_poolId: {
                                poolId: pool.id,
                                userId: user.id,
                            }
                        }
                    }
                }
            }
        }
    })
}

main()