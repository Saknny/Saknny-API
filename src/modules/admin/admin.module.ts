import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { DatabaseModule } from "@src/configs/database/database.module";
import { Admin } from "./entities/admin.entity";
import { AdminService } from "./admin.service";
import { Provider } from "../organization/entities/provider.entity";
import { ProviderModule } from "../organization/provider.module";
import { StudentModule } from "../individual/student.module";
import { Student } from "../individual/entities/student.entity";


@Module({
  imports: [DatabaseModule.forFeature([Admin , Provider , Student]) , 
  ProviderModule
, StudentModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}