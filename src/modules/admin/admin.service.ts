import { Injectable, NotFoundException } from "@nestjs/common";
import { Admin } from "./entities/admin.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Provider } from "../organization/entities/provider.entity";

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Provider)
        private readonly providerRepository: Repository<Provider>,
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
}