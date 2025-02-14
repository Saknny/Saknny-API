import { Injectable, NotFoundException } from "@nestjs/common";
import { Admin } from "./entities/admin.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Provider } from "../provider/entities/provider.entity";
import { Student } from "../student/entities/student.entity";

@Injectable()
export class AdminService {
    constructor(
    ) { }


    
}