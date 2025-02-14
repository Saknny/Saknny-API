import { Injectable, NotFoundException } from "@nestjs/common";
import { Admin } from "./entities/admin.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";

@Injectable()
export class AdminService {
    constructor(
    ) { }


    
}