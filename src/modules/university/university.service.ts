import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { University } from './entities/university/university.entity'; 
import { Major } from './entities/major/major.entity'; 
import { Level } from './entities/level/level.entity'; 
import { BaseRepository } from '@src/libs/types/base-repository';
import { InjectBaseRepository } from '@src/libs/decorators/inject-base-repository.decorator';

@Injectable()
export class UniversityService {
  constructor(
    @InjectBaseRepository(University)
    private readonly universityRepo: BaseRepository<University>,

    @InjectBaseRepository(Major)
    private readonly majorRepo: BaseRepository<Major>,

    @InjectBaseRepository(Level)
    private readonly levelRepo: BaseRepository<Level>,
  ) {}
  // ---------- UNIVERSITY ----------
async getAllUniversities() {
  const universities = await this.universityRepo.find({
    select: ['name'] 
  });
  return universities.map(university => university.name);
}

  async createUniversity(name: string) {
    const university = this.universityRepo.create({ name });
    return this.universityRepo.save(university);
  }

  async updateUniversity(id: string, name: string) {  
  await this.universityRepo.update(id, { name });
  return this.universityRepo.findOne({ id });  
}

  async deleteUniversity(id: string) {
    return this.universityRepo.delete(id);
  }

  async getMajorsByUniversity(universityname: string) {
    const majors= await this.majorRepo.find({
     where: { university: { name: ILike(universityname) } } ,// from 'typeorm'
      select: ['name'] 
    });
    return majors.map(major => major.name);
  }
  async createMajor(universityId: string, name: string) {
    const university = await this.universityRepo.findOneByOrFail({ id: universityId });
    const major = this.majorRepo.create({ name, university });
    return this.majorRepo.save(major);
  }

  async updateMajor(id: string, name: string) {
    await this.majorRepo.update(id, { name });
    return this.majorRepo.findOne({   id });
  }

  async deleteMajor(id: string) {
    return this.majorRepo.delete(id);
  }


async getLevelsByMajorName(majorName: string) {
  const levels = await this.levelRepo.find({
    where: { 
      major: { name: majorName }
    },
    select: ['name'] // Only select the name field
  });

  // Extract just the name values from levels
  return levels.map(level => level.name);
}

  async createLevel(majorId: string, name: string) {
    const major = await this.majorRepo.findOneByOrFail({ id: majorId });
    const level = this.levelRepo.create({ name, major });
    return this.levelRepo.save(level);
  }

  async updateLevel(id: string, name: string) {
    await this.levelRepo.update(id, { name });
    return this.levelRepo.findOne( { id  });
  }

  async deleteLevel(id: string) {
    return this.levelRepo.delete(id);
  }
}
