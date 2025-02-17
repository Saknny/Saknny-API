

import { forwardRef, Module } from "@nestjs/common";
import { DatabaseModule } from "@src/configs/database/database.module";
import { PendingRequest } from "./entities/pendingRequest.entity";
import { PendingRequestService } from "./pendingRequest.service";
import { Provider } from "../provider/entities/provider.entity";
import { ImageApproval } from "./entities/imageApproval.entity";
import { ApartmentModule } from '@src/modules/apartment/apartment.module';
import { BedModule } from "../bed/bed.module";
import { RoomModule } from "../room/room.module";

console.log("PendingRequestModule Imports:", [
    ApartmentModule,
    BedModule,
    RoomModule,
]);

@Module({
    imports: [DatabaseModule.forFeature([PendingRequest, Provider, ImageApproval,])
        , forwardRef(() => ApartmentModule),
    forwardRef(() => RoomModule),
    forwardRef(() => BedModule)],

    providers: [PendingRequestService],
    controllers: [],
    exports: [PendingRequestService]

})
export class PendingRequestModule { }
