import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { DatabaseModule } from "@src/configs/database/database.module";
import { Admin } from "./entities/admin.entity";
import { AdminService } from "./admin.service";
import { Provider } from "../organization/entities/provider.entity";
import { ProviderModule } from "../organization/provider.module";


@Module({
  imports: [DatabaseModule.forFeature([Admin , Provider]) , 
  ProviderModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}