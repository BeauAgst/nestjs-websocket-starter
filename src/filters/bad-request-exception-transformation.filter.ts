import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch(BadRequestException, NotFoundException, UnauthorizedException)
export class BadRequestTransformationFilter extends BaseWsExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const properException = new WsException(exception.getResponse());
        super.catch(properException, host);
    }
}
