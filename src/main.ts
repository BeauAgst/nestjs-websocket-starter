import { NestFactory } from "@nestjs/core";
import { useContainer } from "class-validator";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useLogger(app.get(Logger));
    await app.listen(3000);
}
bootstrap();
