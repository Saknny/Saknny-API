import { Injectable, NotFoundException } from "@nestjs/common";
import { Admin } from "./entities/admin.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Provider } from "../provider/entities/provider.entity";
import { Student } from "../student/entities/student.entity";

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Provider)
        private readonly providerRepository: Repository<Provider>,
        @InjectRepository(Student) private readonly studentRepository: Repository<Student>,
    ) { }

    // Handling Provider Side
    async getUntrustedProviders(): Promise<Provider[]> {
        return this.providerRepository.find({
            where: {
                isTrusted: false,
                idCard: Not(IsNull()),
            },
        });
    }

    async updateProviderApproval(id: string, isTrusted: boolean): Promise<Provider> {
        const provider = await this.providerRepository.findOneBy({ id });
        if (!provider) {
            throw new NotFoundException(`Provider not found`);
        }
        provider.isTrusted = isTrusted;
        return this.providerRepository.save(provider);
    }

    // Handling Student Side
    async getUntrustedStudents(): Promise<Student[]> {
        return this.studentRepository.find({
            where: {
                isTrusted: false,
                idCardImageUrl: Not(IsNull()),
            },
        });
    }

    async updateStudentApproval(id: string, isTrusted: boolean): Promise<Student> {
        const student = await this.studentRepository.findOneBy({ id });
        if (!student) {
            throw new NotFoundException(`student not found`);
        }
        student.isTrusted = isTrusted;
        return this.studentRepository.save(student);
    }
}