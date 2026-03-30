// import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { PassportStrategy } from "@nestjs/passport";
// import { Strategy, ExtractJwt } from "passport-jwt";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(
//     Strategy,
//     'jwt'
// ) {
//     constructor( config: ConfigService ){
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             secretOrKey: config.get<string>('ACCESS_TOKEN')!,
//             });
//     }

//     async validate(payload: any) {
//         return payload;
//     }
// }