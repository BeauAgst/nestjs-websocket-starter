import type { ArgumentsHost } from "@nestjs/common";
import {
    BadRequestException,
    Catch,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { ValidationError } from "class-validator";

@Catch(BadRequestException, NotFoundException, UnauthorizedException, ValidationError)
export class BadRequestTransformationFilter extends BaseWsExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        console.log(exception.message, exception instanceof ValidationError);
        const properException = new WsException(exception.getResponse());
        super.catch(properException, host);
    }
}
