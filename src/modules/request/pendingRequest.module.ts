import { forwardRef, Module } from "@nestjs/common";
import { DatabaseModule } from "@src/configs/database/database.module";
import { PendingRequest } from "./entities/pendingRequest.entity";
import { PendingRequestService } from "./pendingRequest.service";
import { Provider } from "../provider/entities/provider.entity";
import { ImageApproval } from "./entities/imageApproval.entity";
import { ApartmentModule } from '@src/modules/apartment/apartment.module';
import { BedModule } from "../bed/bed.module";
import { RoomModule } from "../room/room.module";
import { ProviderModule } from "../provider/provider.module";

import { StudentModule } from "../student/student.module";
import { ApartmentDocument } from "../apartment/entities/document.entity";
import { PendingDocument } from "./entities/pendingDocument.entity";
import { ImageModule } from "../image/image.module";
import { RequestItem } from "./entities/requestItem.entity";
import { UserModule } from "../user/user.module";
@Module({
    imports: [DatabaseModule.forFeature([PendingRequest, Provider, ImageApproval, PendingDocument , RequestItem])
        , forwardRef(() => ApartmentModule),
    forwardRef(() => RoomModule),
    forwardRef(() => BedModule),
    forwardRef(() => ProviderModule),
    forwardRef(() => StudentModule),
    forwardRef(() => ImageModule),
    forwardRef(() => UserModule)],

    providers: [PendingRequestService],
    controllers: [],
    exports: [PendingRequestService]

})
export class PendingRequestModule { }
