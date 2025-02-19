import { IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, isString, IsString, IsUrl } from 'class-validator';
import 'reflect-metadata';



export class CompleteProviderProfileInput {



    @IsOptional()
    @IsString()
    gender: string

    @IsOptional()
    image: any;


    @IsPhoneNumber(null)
    phone: string;

    @IsOptional()
    @IsUrl()
    instagram: string;

    @IsOptional()
    @IsUrl()
    facebook: string;

    @IsOptional()
    @IsUrl()
    linkedin: string;

    idCard: any;
}
