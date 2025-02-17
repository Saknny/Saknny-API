import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { DatabaseModule } from "@src/configs/database/database.module";
import { Admin } from "./entities/admin.entity";
import { AdminService } from "./admin.service";
import { Provider } from "../provider/entities/provider.entity";
import { ProviderModule } from "../provider/provider.module";
import { StudentModule } from "../student/student.module";
import { Student } from "../student/entities/student.entity";
import { ApartmentModule } from "../apartment/apartment.module";
import { PendingRequestModule } from "../request/pendingRequest.module";


@Module({
  imports: [DatabaseModule.forFeature([Admin, Provider, Student]),
    ProviderModule
    , StudentModule
    , ApartmentModule
  , PendingRequestModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }