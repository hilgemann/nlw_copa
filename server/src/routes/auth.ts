import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"

export async function authRoutes(fastify: FastifyInstance) {
    fastify.get( '/me', {
            onRequest: [authenticate]
        },
        async (request) => {

        return { user: request.user }
    })
    
    fastify.post('/users', async (request) => {
        const createUserBody = z.object({
            access_token: z.string(),
        })
        
        const { access_token }= createUserBody.parse(request.body)

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })

        const userData = await userResponse.json()

        const userInfoSchema = z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string(),
            picture: z.string().url()
        })

        const userInfo = userInfoSchema.parse(userData)

        let user = await prisma.user.findUnique({
            where: {
                googleId: userInfo.id,
            }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    googleId: userInfo.id,
                    name: userInfo.name,
                    email: userInfo.email,
                    avatarUrl: userInfo.picture,
                }
            })
        }

        const token = fastify.jwt.sign({
            name: user.name,
            avatarUrl: user.avatarUrl,
        }, {
            sub: user.id,
            expiresIn: '1 day'
        })

        return {token}

        //ya29.a0AeTM1ieug3_iNRIO1k4gb8u-s63sxlQ2bbqqN2wRIQYIv9wvjYY4F_zNUKQ09E47pnUiYAGyfl4g0QhJWDhTi5Hla40Ssm1MvoKhAmIpydYaV9G_GCaFiF1d1goItSepA7CuwkRlpdjlBcq4dPI5hdwq3WZaaCgYKAQwSARESFQHWtWOmQAqL8k6wdwEpxdbAtg7t1w0163
    })
}